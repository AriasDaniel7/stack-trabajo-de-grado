import { CurrencyPipe, JsonPipe, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { FormUtil } from '@core/utils/form';
import { ProgramService } from '@program/services/program.service';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TableExisting } from '../table-existing/table-existing';
import { PaginationComponent } from '@core/shared/components/pagination/pagination.component';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';
import { PensumList } from '../pensum-list/pensum-list';
import { Pensum } from '@core/interfaces/pensum';
import { CardProgram } from '../card-program/card-program';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { SchoolGradeExisting, SchoolGradeExistingResponse } from '@core/interfaces/school-grade';
import { MethodologyExistingResponse } from '@core/interfaces/methodology';
import { ModalityExistingResponse } from '@core/interfaces/modality';
import { FeeService } from '@fee/services/fee.service';
import { SmmlvResponse } from '@core/interfaces/smmlv';
import { FeeResponse } from '@core/interfaces/fee';
import { Program, ProgramCreate } from '@core/interfaces/program';
import { NormalizedUtil } from '@core/utils/normalized';
import { OrderType } from '@core/interfaces/pagination';
import { AlertService } from '@core/shared/components/alert/alert.service';

@Component({
  selector: 'program-form',
  imports: [
    ReactiveFormsModule,
    TitleCasePipe,
    TableExisting,
    PaginationComponent,
    LoadingComponent,
    PensumList,
    CardProgram,
    CurrencyPipe,
    IconComponent,
    JsonPipe,
  ],
  templateUrl: './form.html',
  styleUrl: './form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Form implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private programService = inject(ProgramService);
  private paginationService = inject(PaginationService);
  private alertService = inject(AlertService);

  educationLevels = input<SchoolGradeExistingResponse | null>(null);
  educationLevelPostgrado = input<SchoolGradeExisting | null>(null);
  smmlvs = input<SmmlvResponse | null>(null);
  fees = input<FeeResponse | null>(null);

  programQuery = this.programService.programExistingQuery;
  currentPage = this.paginationService.currentPage;
  pensumQuery = this.programService.pensumQuery;

  searchTerm = signal('');
  programSelected = signal<Program | null>(null);
  pensumSelected = signal<Pensum | null>(null);

  smmlvSelected = computed(() => {
    const idSmmlv = this.idSmmlv();
    if (idSmmlv) {
      return this.smmlvs()?.data.find((smmlv) => smmlv.id === idSmmlv) || null;
    }
    return null;
  });

  feeSelected = computed(() => {
    const program = this.programSelected();
    const fees = this.fees();

    if (program && fees) {
      if (fees.data.length > 0) {
        return (
          fees.data.find(
            (fee) =>
              fee.modality.name === NormalizedUtil.normalizeNameWithoutTilde(program.modality)
          ) || null
        );
      }

      return null;
    }
    return null;
  });

  creditSmmlvValue = computed(() => {
    const smmlv = this.smmlvSelected();
    const fee = this.feeSelected();

    if (smmlv && fee) {
      return fee.factor_smmlv * smmlv.value;
    }
    return 0;
  });

  tuitionValue = computed(() => {
    const smmlv = this.smmlvSelected();
    const pensum = this.pensumSelected();
    const creditSmmlvValue = this.creditSmmlvValue();

    if (smmlv && pensum && creditSmmlvValue) {
      return Number(pensum.credits || 0) * creditSmmlvValue;
    }

    return 0;
  });

  formUtil = FormUtil;

  myForm = this.fb.group({
    idSmmlv: [null, [Validators.required]],
    codeCDP: [null],
    programOffering: this.fb.group({
      cohort: [null, [Validators.required, Validators.min(1)]],
      semester: [null, [Validators.required, Validators.min(1)]],
    }),
    discounts: this.fb.array<FormGroup>([]),
  });

  totalApplicants = computed(() => {
    this.discountsChanges();

    const controls = this.discountsFormArray.controls;
    return controls.reduce((total, control) => {
      const numberOfApplicants = control.get('numberOfApplicants')?.value || 0;
      return total + Number(numberOfApplicants);
    }, 0);
  });

  totalDiscountedIncome = computed(() => {
    this.discountsChanges();
    const controls = this.discountsFormArray.controls;
    return controls.reduce((total, _, index) => {
      return total + this.discounntedIncomeValue(index);
    }, 0);
  });

  get discountsFormArray() {
    return this.myForm.controls.discounts;
  }

  discounntedIncomeValue(index: number) {
    const discountControl = this.myForm.controls.discounts.at(index);

    const percentage = discountControl.get('percentage')?.value || 0;
    const numberOfApplicants = discountControl.get('numberOfApplicants')?.value || 0;

    const tuitionValue = this.tuitionValue();

    if (tuitionValue) {
      return (
        tuitionValue * numberOfApplicants - tuitionValue * (percentage / 100) * numberOfApplicants
      );
    }

    return 0;
  }

  addDiscount() {
    if (this.discountsFormArray.length < 8) {
      this.discountsFormArray.push(
        this.fb.group({
          percentage: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
          numberOfApplicants: [null, [Validators.required, Validators.min(0)]],
        })
      );
    }
  }

  deleteDiscount(index: number) {
    this.discountsFormArray.removeAt(index);
  }

  onFormChanges = effect(() => {
    const idEducationalLevel = this.educationLevelPostgrado()?.id;
    const page = this.currentPage();
    const expectedOffset = (page - 1) * 10;
    const search = this.searchTerm();

    untracked(() => {
      this.programService.setPaginationProgramExisting({
        limit: 10,
        offset: expectedOffset,
        idEducationalLevel: idEducationalLevel,
        filter: search || undefined,
        order: OrderType.ASC,
      });
    });

    const data = this.programQuery.data();
    const isLoading = this.programQuery.isLoading();

    if (!isLoading && data) {
      if (data.data.length === 0 && data.pages > 0) {
        // Redirigir a la última página válida
        const targetPage = Math.min(page, data.pages);
        if (targetPage !== page) {
          untracked(() => {
            this.router.navigate([], {
              queryParams: { page: targetPage },
              queryParamsHandling: 'merge',
            });
          });
        }
      }
    }
  });

  onSelectProgram = effect(() => {
    const program = this.programSelected();

    if (program) {
      untracked(() => {
        this.pensumSelected.set(null);

        this.programService.setPaginationPensumByProgramId({
          idProgram: program.id,
          limit: 100,
          offset: 0,
        });
      });
    }

    if (program === null) {
      this.pensumSelected.set(null);
      this.programService.setPaginationPensumByProgramId();
    }
  });

  idSmmlv = toSignal(this.myForm.controls.idSmmlv.valueChanges);

  private discountsChanges = toSignal(this.myForm.controls.discounts.valueChanges, {
    initialValue: [],
  });

  ngOnInit() {}

  deleteSelection() {
    this.programSelected.set(null);
    this.pensumSelected.set(null);
  }

  onSubmit() {
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;
    this.alertService.close();

    if (this.programSelected() && this.pensumSelected()) {
      const programCreate: ProgramCreate = {
        idProgramExternal: this.programSelected()!.idProgramExternal
          ? this.programSelected()!.idProgramExternal
          : (this.programSelected()!.id as number),
        name: this.programSelected()!.name,
        unity: this.programSelected()!.unity,
        workday: this.programSelected()!.workday,
        modality: this.programSelected()!.modality,
        methodology: this.programSelected()!.methodology,
        codeCDP: this.myForm.value.codeCDP! ? this.myForm.value.codeCDP! : undefined,
        faculty: this.programSelected()!.faculty ? this.programSelected()!.faculty! : undefined,
        programOffering: {
          cohort: Number(this.myForm.value.programOffering!.cohort),
          semester: Number(this.myForm.value.programOffering!.semester),
        },
        pensum: {
          idPensumExternal: this.pensumSelected()!.idPensumExternal
            ? this.pensumSelected()!.idPensumExternal
            : (this.pensumSelected()!.id as number),
          name: this.pensumSelected()!.description,
          startYear: Number(this.pensumSelected()!.startYear),
          status: this.pensumSelected()!.status,
          credits: this.pensumSelected()!.credits ? this.pensumSelected()!.credits! : 0,
        },
        idSmmlv: this.myForm.value.idSmmlv!,
        discounts: this.myForm.value.discounts!.map((discount) => ({
          percentage: Number(discount.percentage),
          numberOfApplicants: Number(discount.numberOfApplicants),
        })),
      };

      this.programService.create(programCreate).subscribe({
        next: () => {
          this.alertService.open({
            message: 'Credo con exito',
            type: 'success',
          });
          this.myForm.reset();
          this.programSelected.set(null);
          this.pensumSelected.set(null);
        },
        error: (err) => {
          this.alertService.open({
            type: 'error',
            message: err.message,
          });
        },
      });
    }
  }
}

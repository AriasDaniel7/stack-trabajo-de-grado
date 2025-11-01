import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FeeResponse } from '@core/interfaces/fee';
import { OrderType } from '@core/interfaces/pagination';
import { Pensum } from '@core/interfaces/pensum';
import { Program, ProgramCreate } from '@core/interfaces/program';
import { SchoolGradeExisting } from '@core/interfaces/school-grade';
import { SmmlvResponse } from '@core/interfaces/smmlv';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { FormUtil } from '@core/utils/form';
import { NormalizedUtil } from '@core/utils/normalized';
import { ProgramService } from '@program/services/program.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { CurrencyPipe } from '@angular/common';
import { PaginationComponent } from '@core/shared/components/pagination/pagination.component';
import { PensumList } from '../pensum-list/pensum-list';
import { CardProgram } from '../card-program/card-program';
import { TableProgram } from '../table-program/table-program';
import { ModalService } from '@core/shared/components/modal/modal.service';
import { ModalComponent } from '@core/shared/components/modal/modal.component';
import { SelectedSeminar } from '../selected-seminar/selected-seminar';
import { Seminar } from '@core/interfaces/seminar';
import { TableComponent } from '@seminar/components/table/table.component';

@Component({
  selector: 'program-form-register',
  imports: [
    ReactiveFormsModule,
    PaginationComponent,
    PensumList,
    CardProgram,
    CurrencyPipe,
    IconComponent,
    TableProgram,
    ModalComponent,
    SelectedSeminar,
    TableComponent,
  ],
  templateUrl: './form-register-program.html',
  styleUrl: './form-register-program.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormRegisterProgram {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private programService = inject(ProgramService);
  private paginationService = inject(PaginationService);
  private alertService = inject(AlertService);
  private modalService = inject(ModalService);

  educationLevelPostgrado = input<SchoolGradeExisting | null>(null);
  smmlvs = input<SmmlvResponse | null>(null);
  fees = input<FeeResponse | null>(null);
  isOpenModal = this.modalService.isOpen;

  programQuery = this.programService.programAllQuery;
  currentPage = this.paginationService.currentPage;
  pensumQuery = this.programService.pensumQuery;

  searchTerm = signal('');
  programSelected = signal<Program | null>(null);
  pensumSelected = signal<Pensum | null>(null);
  seminars = signal<Seminar[]>([]);

  formUtil = FormUtil;

  myForm = this.fb.group({
    idSmmlv: [null, [Validators.required]],
    programOffering: this.fb.group({
      cohort: [null, [Validators.required, Validators.min(1)]],
      semester: [null, [Validators.required, Validators.min(1)]],
      codeCDP: [null],
    }),
    discounts: this.fb.array<FormGroup>([]),
  });

  private idSmmlv = toSignal(this.myForm.controls.idSmmlv.valueChanges);
  private discountsChanges = toSignal(this.myForm.controls.discounts.valueChanges, {
    initialValue: [],
  });

  get discounts() {
    return this.myForm.controls.discounts;
  }

  onFormChanges = effect(() => {
    const idEducationalLevel = this.educationLevelPostgrado()?.id;
    const page = this.currentPage();
    const expectedOffset = (page - 1) * 10;
    const search = this.searchTerm();

    untracked(() => {
      this.programService.setPaginationProgramAll({
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

  discountedIncomeValue(index: number) {
    const control = this.discounts.controls.at(index);

    const percentage = control?.get('percentage')?.value || 0;
    const numberOfApplicants = control?.get('numberOfApplicants')?.value || 0;

    const tuitionValue = this.tuitionValue();

    if (tuitionValue) {
      return (
        tuitionValue * numberOfApplicants - tuitionValue * (percentage / 100) * numberOfApplicants
      );
    }

    return 0;
  }

  totals = computed(() => {
    this.discountsChanges();

    const controls = this.discounts.controls;

    return controls.reduce(
      (totals, control, index) => {
        const numberOfApplicants = control.get('numberOfApplicants')?.value || 0;
        const discountedIncome = this.discountedIncomeValue(index);

        return {
          totalApplicants: totals.totalApplicants + Number(numberOfApplicants),
          totalDiscountedIncome: totals.totalDiscountedIncome + discountedIncome,
        };
      },
      { totalApplicants: 0, totalDiscountedIncome: 0 }
    );
  });

  addDiscount() {
    if (this.discounts.length < 8) {
      const discountGroup = this.fb.group({
        percentage: [null, [Validators.required, Validators.min(1), Validators.max(100)]],
        numberOfApplicants: [null, [Validators.required, Validators.min(1)]],
      });

      this.discounts.push(discountGroup);
    }
  }

  addSeminar(seminar: Seminar) {
    this.alertService.close();
    const currentSeminars = this.seminars();
    const isDuplicate = currentSeminars.some((s) => s.id === seminar.id);

    if (!isDuplicate) {
      this.seminars.set([...currentSeminars, seminar]);
    } else {
      this.alertService.open({
        message: 'El seminario ya ha sido agregado al programa.',
        type: 'error',
      });
    }
  }

  removeSeminar(seminar: Seminar) {
    const currentSeminars = this.seminars();
    this.seminars.set(currentSeminars.filter((s) => s.id !== seminar.id));
  }

  removeDiscount(index: number) {
    this.discounts.removeAt(index);
  }

  deleteSelection() {
    this.programSelected.set(null);
    this.pensumSelected.set(null);
  }

  onSubmit() {
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;
    this.alertService.close();

    if (
      this.programSelected() &&
      this.pensumSelected() &&
      this.feeSelected() &&
      this.seminars().length > 0
    ) {
      const programCreate: ProgramCreate = {
        idProgramExternal: this.programSelected()!.idProgramExternal
          ? this.programSelected()!.idProgramExternal
          : (this.programSelected()!.id as number),
        name: this.programSelected()!.name,
        unity: this.programSelected()!.unity,
        workday: this.programSelected()!.workday,
        modality: this.programSelected()!.modality,
        methodology: this.programSelected()!.methodology,
        faculty: this.programSelected()!.faculty ? this.programSelected()!.faculty! : undefined,
        programOffering: {
          cohort: Number(this.myForm.value.programOffering!.cohort),
          semester: Number(this.myForm.value.programOffering!.semester),
          codeCDP: this.myForm.value.programOffering!.codeCDP
            ? this.myForm.value.programOffering!.codeCDP!
            : undefined,
        },
        pensum: {
          idPensumExternal: this.pensumSelected()!.idPensumExternal
            ? this.pensumSelected()!.idPensumExternal
            : (this.pensumSelected()!.id as number),
          name: this.pensumSelected()!.name,
          startYear: Number(this.pensumSelected()!.startYear),
          status: this.pensumSelected()!.status,
          credits: this.pensumSelected()!.credits ? this.pensumSelected()!.credits! : 0,
        },
        idSmmlv: this.myForm.value.idSmmlv!,
        idFee: this.feeSelected()!.id,
        discounts: this.myForm.value.discounts!.map((discount) => ({
          percentage: Number(discount.percentage),
          numberOfApplicants: Number(discount.numberOfApplicants),
        })),
        seminars: this.seminars().map((seminar) => ({
          idSeminar: seminar.id,
        })),
      };

      this.programService.create(programCreate).subscribe({
        next: () => {
          this.alertService.open({
            message: 'Oferta académica creada exitosamente.',
            type: 'success',
          });
          this.myForm.reset();
          this.deleteSelection();
          this.myForm.controls.discounts.clear();
          this.seminars.set([]);
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

  openModal() {
    this.modalService.open({
      title: 'Agregar Seminario',
      subTitle: ' Selecciona el seminario que deseas agregar al programa académico.',
    });
  }
}

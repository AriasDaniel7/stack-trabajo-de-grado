import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeeResponse } from '@core/interfaces/fee';
import { Offering, ProgramCreate } from '@core/interfaces/program';
import { SmmlvResponse } from '@core/interfaces/smmlv';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { FormUtil } from '@core/utils/form';
import { CardProgram } from '../card-program/card-program';
import { CardPensum } from '../card-pensum/card-pensum';
import { TableComponent } from '@seminar/components/table/table.component';
import { Seminar } from '@core/interfaces/seminar';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { ModalService } from '@core/shared/components/modal/modal.service';
import { ModalComponent } from '@core/shared/components/modal/modal.component';
import { SelectedSeminar } from '../selected-seminar/selected-seminar';
import { ProgramService } from '@program/services/program.service';

@Component({
  selector: 'program-form-offering',
  imports: [
    IconComponent,
    ReactiveFormsModule,
    CurrencyPipe,
    CardProgram,
    CardPensum,
    TableComponent,
    ModalComponent,
    SelectedSeminar,
  ],
  templateUrl: './form-offering.html',
  styleUrl: './form-offering.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormOffering {
  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);
  private modalService = inject(ModalService);
  private programService = inject(ProgramService);

  offering = input<Offering | null>();
  smmlvs = input<SmmlvResponse | null>(null);
  fees = input<FeeResponse | null>(null);
  isOpenModal = this.modalService.isOpen;

  private _seminars = computed(() => {
    return this.offering()?.seminars || [];
  });

  seminars = linkedSignal<Seminar[]>(this._seminars);

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

  offeringEffect = effect(() => {
    const value = this.offering();

    if (value) {
      if (value.discounts && value.discounts.length > 0) {
        this.discounts.clear();

        value.discounts.forEach((discount) => {
          this.discounts.push(
            this.fb.group({
              percentage: [
                discount.percentage,
                [Validators.required, Validators.min(1), Validators.max(100)],
              ],
              numberOfApplicants: [
                discount.numberOfApplicants,
                [Validators.required, Validators.min(1)],
              ],
            })
          );
        });
      }

      this.myForm.patchValue({
        idSmmlv: value.smmlv.id as any,
        programOffering: {
          cohort: value.cohort as any,
          semester: value.semester as any,
          codeCDP: value.codeCDP as any,
        },
      });
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
    const fees = this.fees();
    const fee = this.offering()?.fee;
    if (fees && fee) {
      return fees.data.find((f) => f.id === fee.id) || null;
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
    const pensum = this.offering()?.pensum;
    const creditSmmlvValue = this.creditSmmlvValue();

    if (smmlv && pensum && creditSmmlvValue) {
      return Number(pensum.credits || 0) * creditSmmlvValue;
    }

    return 0;
  });

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

  get discounts() {
    return this.myForm.controls.discounts;
  }

  addDiscount() {
    if (this.discounts.length < 8) {
      const discountGroup = this.fb.group({
        percentage: [null, [Validators.required, Validators.min(1), Validators.max(100)]],
        numberOfApplicants: [null, [Validators.required, Validators.min(1)]],
      });

      this.discounts.push(discountGroup);
    }
  }

  removeDiscount(index: number) {
    this.discounts.removeAt(index);
  }

  addSeminar(seminar: Seminar) {
    this.alertService.close();
    const currentSeminars = this.seminars();
    const isDuplicate = currentSeminars.some((s) => s.id === seminar.id);

    if (!isDuplicate) {
      const updatedSeminars = [...currentSeminars, seminar].sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      this.seminars.set(updatedSeminars);
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

  openModal() {
    this.modalService.open({
      title: 'Agregar Seminario',
      subTitle: ' Selecciona el seminario que deseas agregar al programa académico.',
    });
  }

  onSubmit() {
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;
    this.alertService.close();

    if (this.feeSelected() && this.seminars().length > 0 && this.offering()) {
      const programUpdate: Partial<ProgramCreate> = {
        programOffering: {
          cohort: Number(this.myForm.value.programOffering!.cohort),
          semester: Number(this.myForm.value.programOffering!.semester),
          codeCDP: this.myForm.value.programOffering!.codeCDP
            ? this.myForm.value.programOffering!.codeCDP!
            : undefined,
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

      this.programService.updateOffering(this.offering()!.id, programUpdate).subscribe({
        next: () => {
          this.alertService.open({
            message: 'Oferta académica actualizada exitosamente.',
            type: 'success',
          });
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

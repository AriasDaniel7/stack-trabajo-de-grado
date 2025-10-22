import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Fee, FeeCreate } from '@core/interfaces/fee';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { NumberFormatDirective } from '@core/shared/directives/numberFormat.directive';
import { FormUtil } from '@core/utils/form';
import { FeeService } from '@fee/services/fee.service';
import { ModalityService } from '@modality/services/modality.service';

@Component({
  selector: 'fee-form',
  imports: [ReactiveFormsModule, IconComponent, NumberFormatDirective, TitleCasePipe],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
  private decimalPipe = new DecimalPipe('es-CO');
  private fb = inject(FormBuilder);
  private feeService = inject(FeeService);
  private modalityService = inject(ModalityService);
  private alertService = inject(AlertService);
  feeInfo = input<Fee | null>(null);

  formUtil = FormUtil;
  modalityQuery = this.modalityService.modalityQuery;

  myForm = this.fb.group({
    modality_id: [null, [Validators.required]],
    factor_smmlv: [null, [Validators.required]],
    credit_value_smmlv: [null, [Validators.required]],
  });

  ngOnInit(): void {
    this.initModalities();

    if (this.feeInfo()) {
      this.myForm.patchValue({
        ...(this.feeInfo() as any),
        factor_smmlv: this.decimalPipe.transform(this.feeInfo()!.factor_smmlv, '1.0-2'),
        credit_value_smmlv: this.decimalPipe.transform(this.feeInfo()!.credit_value_smmlv, '1.0-2'),
        modality_id: this.feeInfo()!.modality.id,
      });
    }
  }

  private initModalities() {
    this.modalityService.setPagination({
      limit: 100,
      offset: 0,
    });
  }

  onSubmit() {
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;

    const feeCreate: FeeCreate = {
      modality_id: this.myForm.value.modality_id!,
      factor_smmlv: Number(
        String(this.myForm.value.factor_smmlv!).replace(/\./g, '').replace(',', '.')
      ),
      credit_value_smmlv: Number(
        String(this.myForm.value.credit_value_smmlv!).replace(/\./g, '').replace(',', '.')
      ),
    };

    this.alertService.close();

    if (this.feeInfo()) {
      this.feeService.update(this.feeInfo()!.id, feeCreate).subscribe({
        next: () => {
          this.alertService.open({
            type: 'success',
            message: 'Tarifa actualizada con éxito',
          });
        },
        error: (err) => {
          this.alertService.open({
            type: 'error',
            message: err.message,
          });
        },
      });
      return;
    }

    this.feeService.create(feeCreate).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: 'Tarifa creada con éxito',
        });
        this.myForm.reset();
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

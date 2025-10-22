import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Smmlv, SmmlvCreate } from '@core/interfaces/smmlv';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { FormUtil } from '@core/utils/form';
import { SmmlvService } from '@smmlv/services/smmlv.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { NumberFormatDirective } from '@core/shared/directives/numberFormat.directive';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'smmlv-form',
  imports: [ReactiveFormsModule, IconComponent, NumberFormatDirective],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private decimalPipe = new DecimalPipe('es-CO');
  private smmlvService = inject(SmmlvService);
  private alertService = inject(AlertService);
  smmlvInfo = input<Smmlv | null>();

  formUtil = FormUtil;

  years = computed(() => {
    const currentYpeear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYpeear - i);
  });

  myForm = this.fb.group({
    year: this.fb.control<string | null>(null, [Validators.required]),
    value: this.fb.control<string | null>(null, [Validators.required]),
  });

  ngOnInit(): void {
    if (this.smmlvInfo()) {
      this.myForm.patchValue({
        year: String(this.smmlvInfo()!.year),
        value: this.decimalPipe.transform(this.smmlvInfo()!.value, '1.0-0'),
      });
    }
  }

  onSubmit() {
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;

    this.alertService.close();

    const data: SmmlvCreate = {
      year: parseFloat(String(this.myForm.value.year!)),
      value: parseFloat(String(this.myForm.value.value!).replace(/\./g, '').replace(',', '.')),
    };

    if (this.smmlvInfo()) {
      this.smmlvService.update(this.smmlvInfo()!.id, data).subscribe({
        next: () => {
          this.alertService.open({
            type: 'success',
            message: 'SMMLV Creado con éxito',
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

    this.smmlvService.create(data).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: 'SMMLV Actualizado con éxito',
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

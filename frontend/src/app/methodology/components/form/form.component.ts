import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Methodology, MethodologyCreate } from '@core/interfaces/methodology';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { FormUtil } from '@core/utils/form';
import { MethodologyService } from '@methodology/services/methodology.service';

@Component({
  selector: 'methodology-form',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private methodologyService = inject(MethodologyService);
  private alertService = inject(AlertService);

  methodologyInfo = input<Methodology | null>(null);

  formUtil = FormUtil;

  myForm = this.fb.group({
    name: [null, [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
  });

  ngOnInit(): void {
    if (this.methodologyInfo()) {
      this.myForm.patchValue({
        name: this.methodologyInfo()!.name as any,
      });
    }
  }

  onSubmit() {
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;

    this.alertService.close();

    const data: MethodologyCreate = {
      name: this.myForm.value.name!,
    };

    if (this.methodologyInfo()) {
      this.methodologyService.update(this.methodologyInfo()!.id, data).subscribe({
        next: () => {
          this.alertService.open({
            type: 'success',
            message: 'Metodología actualizada con éxito',
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

    this.methodologyService.create(data).subscribe({
      next: () => {
        this.myForm.reset();
        this.alertService.open({
          type: 'success',
          message: 'Metodología creada con éxito',
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

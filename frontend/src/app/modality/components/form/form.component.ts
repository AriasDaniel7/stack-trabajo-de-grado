import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modality, ModalityCreate } from '@core/interfaces/modality';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { FormUtil } from '@core/utils/form';
import { ModalityService } from '@modality/services/modality.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'modality-form',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalityService = inject(ModalityService);
  private alertService = inject(AlertService);

  modalityInfo = input<Modality | null>(null);

  formUtil = FormUtil;

  myForm = this.fb.group({
    name: [null, [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
  });

  ngOnInit(): void {
    if (this.modalityInfo()) {
      this.myForm.patchValue({
        name: this.modalityInfo()!.name as any,
      });
    }
  }

  onSubmit() {
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;

    this.alertService.close();

    const data: ModalityCreate = {
      name: this.myForm.value.name!,
    };

    if (this.modalityInfo()) {
      this.modalityService.update(this.modalityInfo()!.id, data).subscribe({
        next: () => {
          this.alertService.open({
            type: 'success',
            message: 'Modalidad actualizada con éxito',
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

    this.modalityService.create(data).subscribe({
      next: () => {
        this.myForm.reset();
        this.alertService.open({
          type: 'success',
          message: 'Modalidad creada con éxito',
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

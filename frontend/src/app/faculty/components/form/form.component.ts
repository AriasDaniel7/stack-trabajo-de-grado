import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Faculty, FacultyCreate } from '@core/interfaces/faculty';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { FormUtil } from '@core/utils/form';
import { FacultyService } from '@faculty/services/faculty.service';

@Component({
  selector: 'faculty-form',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent {
  private fb = inject(FormBuilder);
  private facultyService = inject(FacultyService);
  private alertService = inject(AlertService);

  facultyInfo = input<Faculty | null>(null);

  formUtil = FormUtil;

  myForm = this.fb.group({
    name: [null, [Validators.required, Validators.maxLength(150), Validators.minLength(3)]],
  });

  ngOnInit(): void {
    if (this.facultyInfo()) {
      this.myForm.patchValue({
        name: this.facultyInfo()!.name as any,
      });
    }
  }

  onSubmit() {
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;

    this.alertService.close();

    const data: FacultyCreate = {
      name: this.myForm.value.name!,
    };

    if (this.facultyInfo()) {
      this.facultyService.update(this.facultyInfo()!.id, data).subscribe({
        next: () => {
          this.alertService.open({
            type: 'success',
            message: 'Facultad actualizada con éxito',
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

    this.facultyService.create(data).subscribe({
      next: () => {
        this.myForm.reset();
        this.alertService.open({
          type: 'success',
          message: 'Facultad creada con éxito',
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

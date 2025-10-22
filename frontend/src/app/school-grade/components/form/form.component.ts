import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SchoolGrade, SchoolGradeCreate } from '@core/interfaces/school-grade';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { FormUtil } from '@core/utils/form';
import { SchoolGradeService } from '@school-grade/services/school-grade.service';

@Component({
  selector: 'school-grade-form',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private schoolGService = inject(SchoolGradeService);
  private alertService = inject(AlertService);
  schoolGradeInfo = input<SchoolGrade | null>();

  formUtil = FormUtil;

  myForm = this.fb.group({
    name: [null, [Validators.required, Validators.minLength(3)]],
    level: [null, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    if (this.schoolGradeInfo()) {
      this.myForm.patchValue({
        ...(this.schoolGradeInfo() as any),
      });
    }
  }

  onSubmit() {
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;

    this.alertService.close();

    const data: SchoolGradeCreate = {
      level: this.myForm.value.level!,
      name: this.myForm.value.name!,
    };

    if (this.schoolGradeInfo()) {
      this.schoolGService.update(this.schoolGradeInfo()!.id, data).subscribe({
        next: () => {
          this.alertService.open({
            type: 'success',
            message: 'Nivel académico actualizado con éxito',
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

    this.schoolGService.create(data).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: 'Nivel académico creado con éxito',
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

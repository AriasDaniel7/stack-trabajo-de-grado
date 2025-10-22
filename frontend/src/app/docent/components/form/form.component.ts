import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { SchoolGradeService } from '@school-grade/services/school-grade.service';
import { DocentService } from '@docent/services/docent.service';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { Docent, DocentCreate } from '@core/interfaces/docent';
import { SchoolGrade } from '@core/interfaces/school-grade';
import { FormUtil } from '@core/utils/form';
import { NumberFormatDirective } from '@core/shared/directives/numberFormat.directive';
import { OrderType } from '@core/interfaces/pagination';
@Component({
  selector: 'docent-form',
  imports: [ReactiveFormsModule, IconComponent, TitleCasePipe, NumberFormatDirective],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
  private decimalPipe = new DecimalPipe('es-CO');
  private fb = inject(FormBuilder);
  private schoolGService = inject(SchoolGradeService);
  private docentService = inject(DocentService);
  private alertService = inject(AlertService);

  docentInfo = input<Docent | null>();
  schoolGrades = signal<SchoolGrade[] | null>(null);
  nationalities = signal([
    { label: 'Colombiano', value: 'colombiano' },
    { label: 'Extranjero', value: 'extranjero' },
  ]);
  formUtil = FormUtil;

  typeDocuments = signal([
    { label: 'Cedula de Ciudadania', value: 'cc' },
    { label: 'Tarjeta de Identidad', value: 'ti' },
    { label: 'Cedula de Extranjeria', value: 'ce' },
    { label: 'Pasaporte', value: 'pp' },
  ]);

  myForm = this.fb.group({
    name: [null, [Validators.required]],
    nationality: [null, [Validators.required]],
    document_type: [null, [Validators.required]],
    document_number: [null, [Validators.required]],
    address: [null, [Validators.required]],
    phone: [null, [Validators.required, Validators.min(1), Validators.max(9999999999)]],
    id_school_grade: [null, [Validators.required]],
  });

  async ngOnInit() {
    const res = await this.schoolGService.fetch({
      limit: 100,
      offset: 0,
      order: OrderType.ASC,
    });

    this.schoolGrades.set(res.data);

    if (this.docentInfo()) {
      this.myForm.patchValue({
        ...(this.docentInfo() as any),
        id_school_grade: this.docentInfo()!.school_grade.id,
        document_number: this.decimalPipe.transform(this.docentInfo()!.document_number, '1.0-0'),
      });
    }
  }

  onSubmit() {
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;

    this.alertService.close();

    const document_number = Number(
      String(this.myForm.value.document_number!).replace(/\./g, '').replace(',', '.')
    );

    const data: DocentCreate = {
      name: this.myForm.value.name!,
      nationality: this.myForm.value.nationality!,
      document_type: this.myForm.value.document_type!,
      document_number: String(document_number),
      address: this.myForm.value.address!,
      phone: String(this.myForm.value.phone!),
      id_school_grade: this.myForm.value.id_school_grade!,
    };

    if (this.docentInfo()) {
      this.docentService.update(this.docentInfo()!.id, data).subscribe({
        next: () => {
          this.alertService.open({
            type: 'success',
            message: 'Docente actualizado con éxito',
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

    this.docentService.create(data).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: 'Docente creado con éxito',
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

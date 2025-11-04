import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Docent } from '@core/interfaces/docent';
import { Seminar, SeminarCreate } from '@core/interfaces/seminar';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { FormUtil } from '@core/utils/form';
import { DocentService } from '@docent/services/docent.service';
import { tzDate, parse, format } from '@formkit/tempo';
import { SeminarService } from '@seminar/services/seminar.service';
import { AutoCompleteComponent } from '@core/shared/components/auto-complete/auto-complete.component';
import { NumberFormatDirective } from '@core/shared/directives/numberFormat.directive';

@Component({
  selector: 'seminar-form',
  imports: [ReactiveFormsModule, IconComponent, AutoCompleteComponent, NumberFormatDirective],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private docentService = inject(DocentService);
  private numberPipe = new DecimalPipe('es-CO');
  private seminarService = inject(SeminarService);
  private alertService = inject(AlertService);

  seminarInfo = input<Seminar | null>(null);
  openOptions = signal(false);

  autoComplete = viewChild<AutoCompleteComponent<Docent>>('autoComplete');
  docentQuery = this.docentService.docentQuery;

  vinculationOptions = signal([
    { label: 'Interno', value: 'INTERNAL' },
    { label: 'Externo', value: 'EXTERNAL' },
  ]);

  paymentTypeOptions = signal([
    { label: 'Bonificaciones Planta Admin', value: 'BONIFICACIONES_PLANTA_ADMIN' },
    { label: 'Docente Externo OPS', value: 'DOCENTE_EXTERNO_OPS' },
  ]);

  formUtil = FormUtil;
  docentSearchTerm = signal('');
  docentInfo = signal<Docent | null>(null);

  docentEffect = effect(() => {
    const term = this.docentSearchTerm();

    if (!term) return;

    untracked(() => {
      this.docentService.setPagination({
        limit: 10,
        offset: 0,
        q: term,
      });
    });
  });

  getDocentDisplay = (docent: Docent) => {
    return `${docent.name.toUpperCase()} - ${docent.document_type.toUpperCase()}: ${this.numberPipe.transform(
      docent.document_number
    )}`;
  };

  myForm = this.fb.group({
    name: [null, [Validators.required]],
    credits: [null, [Validators.required, Validators.min(1), Validators.max(10)]],
    docent_vinculation: [null, [Validators.required]],
    payment_type: [null, [Validators.required]],
    docent_id: [null, [Validators.required]],
    dates: this.fb.array([], [Validators.required]),
    is_active: [true, [Validators.required]],
    airTransportValue: [null],
    airTransportRoute: [null],
    landTransportValue: [null],
    landTransportRoute: [null],
    foodAndLodgingAid: [null],
    eventStayDays: [null, [Validators.min(1), Validators.max(30)]],
    hotelLocation: [null],
  });

  get datesArray() {
    return this.myForm.controls.dates;
  }

  deleteDate(index: number) {
    this.datesArray.removeAt(index);
  }

  toggleActive() {
    this.openOptions.update((state) => !state);
  }

  addDate() {
    this.datesArray.push(this.fb.control(null, [Validators.required]));
  }

  setSeletedDocent(docent: Docent | null) {
    if (docent) {
      this.myForm.patchValue({ docent_id: docent.id as any });
    } else {
      this.myForm.patchValue({ docent_id: null });
    }
  }

  ngOnInit(): void {
    if (this.seminarInfo()) {
      const seminarDates = this.seminarInfo()!.dates;
      seminarDates.forEach(() => this.addDate());

      this.myForm.patchValue({
        ...(this.seminarInfo() as any),
        docent_vinculation: this.seminarInfo()!.seminarDocent.vinculation,
        is_active: this.seminarInfo()!.is_active,
        docent_id: this.seminarInfo()!.seminarDocent.docent.id,
        dates: this.seminarInfo()!.dates.map(({ date }) => format(date, 'YYYY-MM-DD')),
        airTransportValue: this.numberPipe.transform(
          this.seminarInfo()!.airTransportValue,
          '1.0-0'
        ),
        landTransportValue: this.numberPipe.transform(
          this.seminarInfo()!.landTransportValue,
          '1.0-0'
        ),
        foodAndLodgingAid: this.numberPipe.transform(
          this.seminarInfo()!.foodAndLodgingAid,
          '1.0-0'
        ),
      });
      this.docentInfo.set(this.seminarInfo()!.seminarDocent.docent);
    }
  }

  onSubmit() {
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;

    this.alertService.close();

    const data: SeminarCreate = {
      name: this.myForm.value.name!,
      credits: this.myForm.value.credits!,
      docent_id: this.myForm.value.docent_id!,
      docent_vinculation: this.myForm.value.docent_vinculation!,
      payment_type: this.myForm.value.payment_type!,
      dates: this.myForm.value.dates!.map((date) => {
        const parsedDate = parse(date as string, 'YYYY-MM-DD');
        return tzDate(parsedDate, 'America/Bogota');
      }),
      is_active: this.myForm.value.is_active!,
      airTransportValue: this.myForm.value.airTransportValue
        ? Number(String(this.myForm.value.airTransportValue).replace(/\./g, '').replace(',', '.'))
        : undefined,
      airTransportRoute: this.myForm.value.airTransportRoute || undefined,
      landTransportValue: this.myForm.value.landTransportValue
        ? Number(String(this.myForm.value.landTransportValue).replace(/\./g, '').replace(',', '.'))
        : undefined,
      landTransportRoute: this.myForm.value.landTransportRoute || undefined,
      foodAndLodgingAid: this.myForm.value.foodAndLodgingAid
        ? Number(String(this.myForm.value.foodAndLodgingAid).replace(/\./g, '').replace(',', '.'))
        : undefined,
      eventStayDays: this.myForm.value.eventStayDays || undefined,
      hotelLocation: this.myForm.value.hotelLocation || undefined,
    };

    if (this.seminarInfo()) {
      this.seminarService.update(this.seminarInfo()!.id, data).subscribe({
        next: () => {
          this.alertService.open({
            type: 'success',
            message: 'Seminario actualizado con éxito',
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

    this.seminarService.create(data).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: 'Seminario creado con éxito',
        });
        this.myForm.reset({
          is_active: true,
        });
        this.datesArray.clear();
        this.autoComplete()?.clearInput();
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

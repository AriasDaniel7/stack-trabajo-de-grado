import { DatePipe, DecimalPipe, I18nSelectPipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Seminar } from '@core/interfaces/seminar';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'seminar-table',
  imports: [IconComponent, TitleCasePipe, DatePipe, I18nSelectPipe, DecimalPipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  seminaries = input<Seminar[] | null>();
  onEdit = output<Seminar>();
  onDelete = output<Seminar>();
  showEdit = input<boolean>(true);

  paymentTypeMapping = {
    BONIFICACIONES_PLANTA_ADMIN: 'Bonificaciones Planta Admin',
    DOCENTE_EXTERNO_OPS: 'Docente Externo OPS',
  };

  docentVinculationMapping = {
    INTERNAL: 'Interno',
    EXTERNAL: 'Externo',
  };
}

import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  I18nSelectPipe,
  TitleCasePipe,
} from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Seminar } from '@core/interfaces/seminar';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'seminar-table',
  imports: [IconComponent, TitleCasePipe, DatePipe, I18nSelectPipe, DecimalPipe, CurrencyPipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  seminaries = input<Seminar[] | null>();
  onEdit = output<Seminar>();
  onDelete = output<Seminar>();
  showEdit = input<boolean>(true);
  messageNoData = input<string>('No hay seminarios registrados');
  colorMessageNoData = input<string>('text-gray-500');

  expandedRows = signal<Set<string>>(new Set());

  paymentTypeMapping = {
    BONIFICACIONES_PLANTA_ADMIN: 'Bonificaciones Planta Admin',
    DOCENTE_EXTERNO_OPS: 'Docente Externo OPS',
  };

  docentVinculationMapping = {
    INTERNAL: 'Interno',
    EXTERNAL: 'Externo',
  };

  toggleRow(seminarId: string) {
    this.expandedRows.update((rows) => {
      const newRows = new Set(rows);
      if (newRows.has(seminarId)) {
        newRows.delete(seminarId);
      } else {
        newRows.add(seminarId);
      }
      return newRows;
    });
  }

  isRowExpanded(seminarId: string) {
    return this.expandedRows().has(seminarId);
  }
}

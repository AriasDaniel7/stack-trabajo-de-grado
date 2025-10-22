import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Smmlv } from '@core/interfaces/smmlv';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'smmlv-table',
  imports: [CurrencyPipe, IconComponent, DatePipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  smmlvs = input.required<Smmlv[]>();

  onDelete = output<Smmlv>();
  onEdit = output<Smmlv>();
}

import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Fee } from '@core/interfaces/fee';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'fee-table',
  imports: [TitleCasePipe, IconComponent, DecimalPipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  rates = input.required<Fee[]>();

  onEdit = output<Fee>();
  onDelete = output<Fee>();
}

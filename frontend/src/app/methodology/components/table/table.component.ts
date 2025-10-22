import { DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Methodology } from '@core/interfaces/methodology';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'methodology-table',
  imports: [IconComponent, DatePipe, TitleCasePipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  methodologies = input.required<Methodology[]>();
  onEdit = output<Methodology>();
  onDelete = output<Methodology>();
}

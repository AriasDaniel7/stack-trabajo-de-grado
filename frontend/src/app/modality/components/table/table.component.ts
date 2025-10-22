import { DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Modality } from '@core/interfaces/modality';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'modality-table',
  imports: [IconComponent, TitleCasePipe, DatePipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  modalities = input.required<Modality[]>();
  onEdit = output<Modality>();
  onDelete = output<Modality>();
}

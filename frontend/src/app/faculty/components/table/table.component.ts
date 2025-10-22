import { DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Faculty } from '@core/interfaces/faculty';
import { IconComponent } from "@core/shared/components/icon/icon.component";

@Component({
  selector: 'faculty-table',
  imports: [DatePipe, TitleCasePipe, IconComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  faculties = input.required<Faculty[]>();
  onEdit = output<Faculty>();
  onDelete = output<Faculty>();
}

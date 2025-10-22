import { DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SchoolGrade } from '@core/interfaces/school-grade';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'school-grade-table',
  imports: [TitleCasePipe, DatePipe, IconComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  schoolGrades = input.required<SchoolGrade[]>();
  onEdit = output<SchoolGrade>();
  onDelete = output<SchoolGrade>();
}

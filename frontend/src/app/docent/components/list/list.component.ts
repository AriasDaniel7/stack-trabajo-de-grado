import { DatePipe, DecimalPipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Docent } from '@core/interfaces/docent';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'docent-list',
  imports: [IconComponent, TitleCasePipe, UpperCasePipe, DatePipe, DecimalPipe],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  docents = input.required<Docent[]>();
  onEdit = output<Docent>();
  onDelete = output<Docent>();
}

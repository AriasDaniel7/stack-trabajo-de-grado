import { DecimalPipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Docent } from '@core/interfaces/docent';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'docent-table',
  imports: [IconComponent, TitleCasePipe, UpperCasePipe, DecimalPipe],
  templateUrl: './table.html',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table {
  docents = input<Docent[]>();
  onEdit = output<Docent>();
  onDelete = output<Docent>();
  isLoading = input<boolean>();
}

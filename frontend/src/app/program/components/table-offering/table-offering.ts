import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Offering } from '@core/interfaces/program';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'program-table-offering',
  imports: [DatePipe, IconComponent, RouterLink],
  templateUrl: './table-offering.html',
  styleUrl: './table-offering.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableOffering {
  offerings = input<Offering[]>();
  isLoading = input<boolean>();
  onDelete = output<Offering>();
}

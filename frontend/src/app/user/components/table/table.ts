import { DatePipe, LowerCasePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '@core/interfaces/user';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'user-table',
  imports: [TitleCasePipe, LowerCasePipe, DatePipe, IconComponent, RouterLink],
  templateUrl: './table.html',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table {
  isLoading = input<boolean>();
  users = input<User[]>();
  onDelete = output<User>();
}

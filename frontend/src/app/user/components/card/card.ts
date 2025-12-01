import { DatePipe, LowerCasePipe, SlicePipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { User } from '@core/interfaces/user';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'user-card',
  imports: [SlicePipe, UpperCasePipe, IconComponent, TitleCasePipe, LowerCasePipe, DatePipe],
  templateUrl: './card.html',
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  user = input<User | null>(null);
  isLoading = input<boolean>();
}

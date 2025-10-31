import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Pensum } from '@core/interfaces/pensum';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'program-card-pensum',
  imports: [IconComponent, TitleCasePipe],
  templateUrl: './card-pensum.html',
  styleUrl: './card-pensum.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardPensum {
  pensum = input<Pensum | null>();
  isSelected = input<boolean>(false);
}

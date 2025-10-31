import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Pensum } from '@core/interfaces/pensum';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { CardPensum } from '../card-pensum/card-pensum';
import { LoadingComponent } from "@core/shared/components/loading/loading.component";

@Component({
  selector: 'program-pensum-list',
  imports: [IconComponent, CardPensum, LoadingComponent],
  templateUrl: './pensum-list.html',
  styleUrl: './pensum-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PensumList {
  pensums = input<Pensum[]>();
  isLoading = input<boolean>();

  selectPensum = model<Pensum | null>(null);

  onSelect(pensum: Pensum) {
    this.selectPensum.set(pensum);
  }
}

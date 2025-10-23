import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Pensum } from '@core/interfaces/pensum';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'program-pensum-list',
  imports: [IconComponent, TitleCasePipe],
  templateUrl: './pensum-list.html',
  styleUrl: './pensum-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PensumList {
  pensumList = input.required<Pensum[]>();

  selectPensum = model<Pensum | null>(null);

  onSelect(pensum: Pensum) {
    this.selectPensum.set(pensum);
  }
}

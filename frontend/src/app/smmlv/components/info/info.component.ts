import { CurrencyPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SmmlvResponse } from '@core/interfaces/smmlv';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'smmlv-info',
  imports: [CurrencyPipe, PercentPipe, IconComponent],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent {
  smmlvResponse = input<SmmlvResponse>();

  currentData = computed(() => {
    const response = this.smmlvResponse();
    if (response) {
      const data = response.data;
      if (data.length > 0) {
        return data[0];
      }
    }
    return null;
  });

  annualVariationPercent = computed(() => {
    const response = this.smmlvResponse();
    if (response) {
      const data = response.data;
      if (data.length > 1) {
        const current = data[0];
        const previous = data[1];
        if (previous.value === 0) return null;
        return (current.value - previous.value) / previous.value;
      }
    }
    return null;
  });
}

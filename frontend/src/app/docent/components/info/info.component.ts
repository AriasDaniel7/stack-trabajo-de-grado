import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DocentResponse } from '@core/interfaces/docent';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'docent-info',
  imports: [IconComponent],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent {
  docentResponse = input<DocentResponse>();

  lastDays = computed(() => {
    const response = this.docentResponse();
    if (!response) return 0;
    const data = response.data;
    if (data.length === 0) return 0;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return data.filter((docent) => {
      const createdAt = new Date(docent.createdAt);
      return createdAt >= thirtyDaysAgo;
    }).length;
  });
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SeminarResponse } from '@core/interfaces/seminar';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'seminar-info',
  imports: [IconComponent],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent {
  seminarResponse = input<SeminarResponse>();

  seminariesActiveCount = computed(() => {
    const response = this.seminarResponse();
    if (response) {
      const data = response.data;
      if (data && data.length > 0) {
        return data.filter((seminar) => seminar.is_active).length;
      }
    }
    return 0;
  });

  seminariesVinculationInternalCount = computed(() => {
    const response = this.seminarResponse();
    if (response) {
      const data = response.data;
      if (data && data.length > 0) {
        return data.filter((seminar) => seminar.seminarDocent.vinculation === 'INTERNAL').length;
      }
    }
    return 0;
  });

  seminariesVinculationExternalCount = computed(() => {
    const response = this.seminarResponse();
    if (response) {
      const data = response.data;
      if (data && data.length > 0) {
        return data.filter((seminar) => seminar.seminarDocent.vinculation === 'EXTERNAL').length;
      }
    }
    return 0;
  });
}

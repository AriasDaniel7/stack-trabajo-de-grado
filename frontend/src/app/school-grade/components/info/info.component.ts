import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SchoolGradeResponse } from '@core/interfaces/school-grade';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'school-grade-info',
  imports: [IconComponent],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent {
  schoolGradeResponse = input<SchoolGradeResponse>();

  levelMax = computed(() => {
    const response = this.schoolGradeResponse();
    if (response) {
      const data = response.data;
      if (data.length > 0) {
        return Math.max(...data.map((item) => item.level));
      }
      return 0;
    }
    return 0;
  });

  levelMin = computed(() => {
    const response = this.schoolGradeResponse();
    if (response) {
      const data = response.data;
      if (data.length > 0) {
        return Math.min(...data.map((item) => item.level));
      }
      return 0;
    }
    return 0;
  });
}

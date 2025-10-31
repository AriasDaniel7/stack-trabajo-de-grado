import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ProgramResponse } from '@core/interfaces/program';
import { SchoolGradeResponse } from '@core/interfaces/school-grade';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'program-info',
  imports: [IconComponent],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent {
  programResponse = input<ProgramResponse>();

  countWithFaculty(): number {
    const programs = this.programResponse()?.data || [];
    return programs.filter((program) => program.faculty).length;
  }
}

import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Program } from '@core/interfaces/program';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'program-card',
  imports: [TitleCasePipe, IconComponent],
  templateUrl: './card-program.html',
  styleUrl: './card-program.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardProgram {
  program = input<Program | null>();
  
}

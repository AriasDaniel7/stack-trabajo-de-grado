import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Program } from '@core/interfaces/program';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'program-table',
  imports: [TitleCasePipe, IconComponent, RouterLink],
  templateUrl: './table-program.html',
  styleUrl: './table-program.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableProgram {
  programs = input<Program[]>();
  isLoading = input<boolean>();
  select = input(false);
  enableRouterLink = input(false);
  onDelete = output<Program>();

  selectProgram = model<Program | null>(null);

  onSelect(program: Program) {
    this.selectProgram.set(program);
  }

  programSelectEqual(program: Program) {
    return this.selectProgram()?.idUnityProgram === program.idUnityProgram;
  }
}

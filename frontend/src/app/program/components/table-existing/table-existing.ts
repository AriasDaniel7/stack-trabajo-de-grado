import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Program } from '@core/interfaces/program';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';

@Component({
  selector: 'program-table-existing',
  imports: [TitleCasePipe, LoadingComponent],
  templateUrl: './table-existing.html',
  styleUrl: './table-existing.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableExisting {
  programs = input<Program[]>();
  isLoading = input<boolean>();
  selectProgram = model<Program | null>(null);

  onSelect(program: Program) {
    this.selectProgram.set(program);
  }
}

import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { ProgramExisting } from '@core/interfaces/program';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';

@Component({
  selector: 'program-table-existing',
  imports: [TitleCasePipe, LoadingComponent],
  templateUrl: './table-existing.html',
  styleUrl: './table-existing.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableExisting {
  programs = input<ProgramExisting[]>();
  isLoading = input<boolean>();
  selectProgram = signal<ProgramExisting | null>(null);
  onSelectProgram = output<ProgramExisting>();

  onSelect(program: ProgramExisting) {
    this.selectProgram.set(program);
    this.onSelectProgram.emit(program);
  }
}

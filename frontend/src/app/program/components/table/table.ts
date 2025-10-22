import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'program-table',
  imports: [],
  templateUrl: './table.html',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table {}

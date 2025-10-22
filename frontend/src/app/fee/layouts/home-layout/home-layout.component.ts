import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'fee-home-layout',
  imports: [RouterOutlet],
  templateUrl: './home-layout.component.html',
  styleUrl: './home-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeLayoutComponent {}

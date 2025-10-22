import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'seminar-home-layout',
  imports: [RouterOutlet],
  templateUrl: './home-layout.component.html',
  styleUrl: './home-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeLayoutComponent {}

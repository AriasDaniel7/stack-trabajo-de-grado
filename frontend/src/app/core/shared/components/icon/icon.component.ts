import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'shared-icon',
  imports: [],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  icon = input<string>('');
  classList = input<string>('w-4 h-4');
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'shared-loading',
  imports: [],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent {
  classList = input<string>('border-2 w-12 h-12');
}

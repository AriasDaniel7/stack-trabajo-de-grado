import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { AlertService } from './alert.service';

@Component({
  selector: 'shared-alert',
  imports: [NgClass, IconComponent],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  private alertModalService = inject(AlertService);
  timer: NodeJS.Timeout | null = null;

  options = this.alertModalService.options;
  isOpen = this.alertModalService.isOpen;

  closeModalEffect = effect((onCleanup) => {
    if (this.isOpen()) {
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(() => {
        this.alertModalService.close();
        this.timer = null;
      }, 3000);
    }

    onCleanup(() => {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    });
  });
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ModalService } from './modal.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'shared-modal',
  imports: [IconComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  private modalService = inject(ModalService);

  isOpen = this.modalService.isOpen;
  options = this.modalService.options;
  isClosing = signal(false);

  close() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.modalService.close();
      this.isClosing.set(false);
    }, 200);
  }
}

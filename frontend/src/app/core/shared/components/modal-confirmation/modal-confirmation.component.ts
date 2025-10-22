import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ModalConfirmationService } from './modal-confirmation.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'shared-modal-confirmation',
  imports: [IconComponent],
  templateUrl: './modal-confirmation.component.html',
  styleUrl: './modal-confirmation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalConfirmationComponent {
  private modalConfirmationService = inject(ModalConfirmationService);

  isOpen = this.modalConfirmationService.isOpen;
  options = this.modalConfirmationService.options;
  isClosing = signal(false);

  confirm() {
    this.modalConfirmationService.confirm();
  }

  cancel() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.modalConfirmationService.cancel();
      this.isClosing.set(false);
      this.modalConfirmationService.close();
    }, 200);
  }
}

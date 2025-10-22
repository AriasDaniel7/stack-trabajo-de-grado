import { computed, Injectable, signal } from '@angular/core';

export interface ConfirmationsOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmAction?: () => void;
  cancelAction?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class ModalConfirmationService {
  private _isOpen = signal(false);
  private _options = signal<ConfirmationsOptions | null>(null);

  isOpen = computed(this._isOpen);
  options = computed(this._options);

  open(options: ConfirmationsOptions) {
    this._options.set(options);
    this._isOpen.set(true);
  }

  close() {
    this._isOpen.set(false);
    this._options.set(null);
  }

  confirm() {
    const currentOptions = this._options();
    if (currentOptions?.confirmAction) {
      currentOptions.confirmAction();
    }
  }

  cancel() {
    const currentOptions = this._options();
    if (currentOptions?.cancelAction) {
      currentOptions.cancelAction();
    }
  }
}

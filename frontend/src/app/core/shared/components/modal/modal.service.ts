import { computed, Injectable, signal } from '@angular/core';

export interface ModalOptions {
  title?: string;
  subTitle?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private _isOpen = signal(false);
  private _options = signal<ModalOptions | null>(null);

  isOpen = computed(this._isOpen);
  options = computed(this._options);

  open(options: ModalOptions) {
    this._options.set(options);
    this._isOpen.set(true);
  }

  close() {
    this._isOpen.set(false);
    this._options.set(null);
  }
}

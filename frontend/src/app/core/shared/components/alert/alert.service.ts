import { computed, Injectable, signal } from '@angular/core';

export type AlertIcon = 'info' | 'success' | 'warning' | 'error';

export interface AlertOptions {
  message?: string;
  type?: AlertIcon;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private _isOpen = signal(false);
  private _options = signal<AlertOptions | null>(null);

  isOpen = computed(this._isOpen);
  options = computed(this._options);

  open(options: AlertOptions) {
    this._options.set(options);
    this._isOpen.set(true);
  }

  close() {
    this._isOpen.set(false);
    this._options.set(null);
  }
}

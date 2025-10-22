import { computed, Injectable, signal } from '@angular/core';

export interface HeaderOptions {
  title?: string;
  subTitle?: string;
  placeholder?: string;
  showSearch?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private _options = signal<HeaderOptions>({});
  private _search = signal<string>('');

  options = computed(this._options);
  search = computed(this._search);

  setOptions(options: HeaderOptions) {
    const { showSearch = true, ...optionsData } = options;
    this._options.set({ ...optionsData, showSearch });
  }

  setSearch(search: string) {
    this._search.set(search);
  }

  clear() {
    this._options.set({});
    this._search.set('');
  }
}

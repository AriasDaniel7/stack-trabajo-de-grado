import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'shared-auto-complete',
  imports: [LoadingComponent, FormsModule, IconComponent],
  templateUrl: './auto-complete.component.html',
  styleUrl: './auto-complete.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutoCompleteComponent<T> {
  inputSearch = viewChild<ElementRef<HTMLInputElement>>('txtSearch');

  items = input<T[]>();
  displayWith = input.required<(item: T) => string>();
  isLoading = input<boolean>(false);
  placeholder = input<string>('Buscar...');
  initialValue = input<T | null>(null);

  searchChange = output<string>();
  selectedItem = output<T | null>();

  searchTerm = signal('');
  showDropdown = signal(false);
  selectValid = signal(false);
  private _selectedItem = signal<T | null>(null);

  itemChange = effect(() => {
    const initial = this.initialValue();
    if (initial) {
      untracked(() => {
        this.selectItem(initial);
      });
    }
  });

  onSearchInput() {
    const value = this.inputSearch()!.nativeElement.value.trim().toLowerCase();
    this.searchTerm.set(value);
    this.searchChange.emit(value);

    const currentItem = this._selectedItem();
    const isValid = currentItem ? this.displayWith()(currentItem).toLowerCase() === value : false;
    this.selectValid.set(isValid);

    this.showDropdown.set(value.length > 0);

    if (!value) {
      this.clearSelection();
    } else if (!isValid) {
      this.clearSelection();
    }
  }

  selectItem(item: T) {
    this.inputSearch()!.nativeElement.value = this.displayWith()(item);
    this._selectedItem.set(item);
    this.selectValid.set(true);
    this.showDropdown.set(false);
    this.selectedItem.emit(item);
    this.searchTerm.set(this.displayWith()(item).toLowerCase());
  }

  onInputBlur(): void {
    setTimeout(() => {
      this.showDropdown.set(false);
    }, 200);
  }

  onInputFocus() {
    if (this.searchTerm()) {
      this.showDropdown.set(true);
    }
  }

  clearInput() {
    this.inputSearch()!.nativeElement.value = '';
    this.searchTerm.set('');
    this.searchChange.emit('');
    this.showDropdown.set(false);
    this.inputSearch()!.nativeElement.focus();
    this._selectedItem.set(null);
    this.selectValid.set(false);
    this.selectedItem.emit(null);
  }

  private clearSelection() {
    this._selectedItem.set(null);
    this.selectValid.set(false);
    this.selectedItem.emit(null);
  }
}

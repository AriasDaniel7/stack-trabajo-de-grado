import { DecimalPipe, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { Seminar } from '@core/interfaces/seminar';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { ModalService } from '@core/shared/components/modal/modal.service';
import { SeminarService } from '@seminar/services/seminar.service';

@Component({
  selector: 'program-selected-seminar',
  imports: [IconComponent, TitleCasePipe],
  templateUrl: './selected-seminar.html',
  styleUrl: './selected-seminar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedSeminar implements OnDestroy {
  private seminarService = inject(SeminarService);
  private modalService = inject(ModalService);

  search = signal('');
  selectedSeminar = signal<Seminar | null>(null);
  seminarQuery = this.seminarService.seminarQuery;
  seminarSelected = output<Seminar>();
  errorMessage = signal<string | null>(null);

  searchEffect = effect(() => {
    const searchValue = this.search();
    if (searchValue) {
      this.seminarService.setPagination({
        limit: 10,
        offset: 0,
        name: searchValue,
      });
    }
  });

  onSelect(seminar: Seminar) {
    this.selectedSeminar.set(seminar);
  }

  ngOnDestroy(): void {
    this.search.set('');
    this.selectedSeminar.set(null);
  }

  emitSelectedSeminar() {
    if (this.selectedSeminar()) {
      this.errorMessage.set(null);
      this.seminarSelected.emit(this.selectedSeminar()!);
      this.modalService.close();
    } else {
      this.errorMessage.set('Por favor, selecciona un seminario antes de confirmar.');
    }
  }
}

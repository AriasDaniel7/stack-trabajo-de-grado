import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'shared-pagination',
  imports: [RouterLink],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  currentPage = input<number>(1);
  pages = input<number>(0);

  activePage = linkedSignal(this.currentPage);

  next() {
    this.activePage.update((page) => page + 1);
  }

  previous() {
    this.activePage.update((page) => (page > 1 ? page - 1 : 1));
  }
}

import { inject, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaginationService {
  private activatedRoute = inject(ActivatedRoute);

  currentPage = toSignal(
    this.activatedRoute.queryParamMap.pipe(
      map((params) => (params.get('page') ? +params.get('page')! : 1)),
      map((page) => (isNaN(page) || page <= 0 ? 1 : page))
    ),
    {
      initialValue: 1,
    }
  );
}

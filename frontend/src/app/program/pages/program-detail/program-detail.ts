import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { HeaderService } from '@dashboard/components/header/header.service';
import { ProgramService } from '@program/services/program.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-program-detail',
  imports: [JsonPipe],
  templateUrl: './program-detail.html',
  styleUrl: './program-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgramDetail implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private headerService = inject(HeaderService);
  private programService = inject(ProgramService);
  private paginationService = inject(PaginationService);
  private router = inject(Router);

  idProgramPlacement = toSignal<string>(
    this.activatedRoute.params.pipe(map((params) => params['idProgramPlacement']))
  );

  offeringsQuery = this.programService.offeringsQuery;
  currentPage = this.paginationService.currentPage;

  changeData = effect(() => {
    const page = this.currentPage();
    const limit = 10;
    const expectedOffset = (page - 1) * limit;
    const idProgramPlacement = this.idProgramPlacement();

    if (idProgramPlacement) {
      untracked(() => {
        this.programService.setPaginationOfferings({
          idProgramPlacement,
          limit,
          offset: expectedOffset,
        });

        const data = this.offeringsQuery.data();
        const isLoading = this.offeringsQuery.isLoading();

        if (!isLoading && data) {
          if (data.data.length === 0 && data.pages > 0) {
            // Redirigir a la última página válida
            const targetPage = Math.min(page, data.pages);
            if (targetPage !== page) {
              this.router.navigate([], {
                queryParams: { page: targetPage },
                queryParamsHandling: 'merge',
              });
            }
          }
        }
      });
    }
  });

  ngOnInit() {
    this.headerService.setOptions({
      title: 'Gestionar Ofertas del Programa',
      subTitle: 'Administrar las ofertas académicas del programa seleccionado',
      placeholder: 'Buscar por cohorte o semestre...',
    });
  }
}

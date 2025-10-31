import { TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Offering, Program } from '@core/interfaces/program';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { HeaderService } from '@dashboard/components/header/header.service';
import { ProgramService } from '@program/services/program.service';
import { map } from 'rxjs';
import { InfoOffering } from '@program/components/info-offering/info-offering';
import { TableOffering } from '@program/components/table-offering/table-offering';
import { PaginationComponent } from '@core/shared/components/pagination/pagination.component';
import { ModalConfirmationComponent } from '@core/shared/components/modal-confirmation/modal-confirmation.component';
import { ModalConfirmationService } from '@core/shared/components/modal-confirmation/modal-confirmation.service';
import { AlertService } from '@core/shared/components/alert/alert.service';

@Component({
  selector: 'app-offerings',
  imports: [InfoOffering, TableOffering, PaginationComponent, ModalConfirmationComponent],
  templateUrl: './offerings.html',
  styleUrl: './offerings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Offerings implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private titleCase = new TitleCasePipe();
  private headerService = inject(HeaderService);
  private programService = inject(ProgramService);
  private paginationService = inject(PaginationService);
  private modalConfirmationService = inject(ModalConfirmationService);
  private alertService = inject(AlertService);
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

  async ngOnInit() {
    const idProgramPlacement = this.idProgramPlacement();

    let program: Program | null = null;

    if (idProgramPlacement) {
      program = await this.programService.programByIdPlacemenet(idProgramPlacement);
    }

    if (!program) {
      this.router.navigateByUrl('/dashboard/programs/program-management');
      return;
    }

    this.headerService.setOptions({
      title: program ? this.titleCase.transform(program.name) : 'Oferta Académica',
      subTitle: 'Administrar las ofertas académicas del programa seleccionado',
      showSearch: false,
    });
  }

  onDelete(offering: Offering) {
    this.modalConfirmationService.open({
      title: 'Eliminar oferta académica',
      message: `¿Estás seguro de que deseas eliminar la oferta académica para la cohorte "${offering.cohort}" y el semestre "${offering.semester}"? Esta acción no se puede deshacer.`,
      confirmAction: () => this.deleteOffering(offering.id),
    });
  }

  private deleteOffering(idOffering: string) {
    this.programService.deleteOffering(idOffering).subscribe({
      next: () => {
        this.alertService.open({
          message: 'Oferta académica eliminada exitosamente.',
          type: 'success',
        });
        this.modalConfirmationService.close();
      },
      error: (err) => {
        this.alertService.open({
          message: err.message,
          type: 'error',
        });
      },
    });
  }
}

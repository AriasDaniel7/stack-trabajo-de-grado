import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { SeminarService } from '@seminar/services/seminar.service';
import { InfoComponent } from '@seminar/components/info/info.component';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { HeaderService } from '@dashboard/components/header/header.service';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { Router } from '@angular/router';
import { ModalService } from '@core/shared/components/modal/modal.service';
import { ModalConfirmationService } from '@core/shared/components/modal-confirmation/modal-confirmation.service';
import { Seminar } from '@core/interfaces/seminar';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';
import { PaginationComponent } from '@core/shared/components/pagination/pagination.component';
import { ModalComponent } from '@core/shared/components/modal/modal.component';
import { ModalConfirmationComponent } from '@core/shared/components/modal-confirmation/modal-confirmation.component';
import { TableComponent } from '@seminar/components/table/table.component';
import { FormComponent } from '@seminar/components/form/form.component';

@Component({
  selector: 'app-home-page',
  imports: [
    InfoComponent,
    IconComponent,
    LoadingComponent,
    PaginationComponent,
    ModalComponent,
    ModalConfirmationComponent,
    TableComponent,
    FormComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePageComponent implements OnInit, OnDestroy {
  private seminarService = inject(SeminarService);
  private headerService = inject(HeaderService);
  private alertService = inject(AlertService);
  private paginationService = inject(PaginationService);
  private router = inject(Router);
  private modalService = inject(ModalService);
  private modalConfirmationService = inject(ModalConfirmationService);

  private _seminarInfo = signal<Seminar | null>(null);

  seminarQuery = this.seminarService.seminarQuery;
  currentPage = this.paginationService.currentPage;
  isOpenModal = this.modalService.isOpen;
  isOpenModalConfirmation = this.modalConfirmationService.isOpen;
  seminarInfo = computed(this._seminarInfo);

  changeData = effect(() => {
    const page = this.currentPage();
    const limit = 10;
    const expectedOffset = (page - 1) * limit;

    this.seminarService.setPagination({
      limit,
      offset: expectedOffset,
    });

    const data = this.seminarQuery.data();
    const isLoading = this.seminarQuery.isLoading();

    if (!isLoading && data) {
      if (data.data.length === 0 && data.pages > 0) {
        // Redirigir a la última página válida
        const targetPage = Math.min(page, data.pages);
        if (targetPage !== page) {
          untracked(() => {
            this.router.navigate([], {
              queryParams: { page: targetPage },
              queryParamsHandling: 'merge',
            });
          });
        }
      }
    }
  });

  openModal(seminar?: Seminar) {
    this._seminarInfo.set(seminar ? seminar : null);

    this.modalService.open({
      title: seminar ? 'Editar seminario' : 'Agregar seminario',
      subTitle: seminar
        ? 'Modifica los datos del seminario'
        : 'Llena los datos para agregar un nuevo seminario',
    });
  }

  ngOnInit(): void {
    this.headerService.setOptions({
      title: 'Gestión de Seminarios',
      subTitle: 'Administra los seminarios de posgrado',
      placeholder: 'Buscar seminarios...',
      showSearch: false,
    });
  }

  ngOnDestroy(): void {
    this.headerService.clear();
    this.alertService.close();
  }

  onDelete(seminar: Seminar) {
    this.modalConfirmationService.open({
      title: 'Eliminar seminario',
      message: `¿Estás seguro de eliminar el seminario "${seminar.name.toUpperCase()}"?`,
      confirmAction: () => this.delete(seminar.id),
    });
  }

  private delete(id: string) {
    this.seminarService.delete(id).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: 'Seminario eliminado correctamente.',
        });
        this.modalConfirmationService.close();
      },
      error: (err) => {
        this.alertService.open({
          type: 'error',
          message: err.message,
        });
      },
    });
  }
}

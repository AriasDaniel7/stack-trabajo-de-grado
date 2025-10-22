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
import { AlertService } from '@core/shared/components/alert/alert.service';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { HeaderService } from '@dashboard/components/header/header.service';
import { DocentService } from '@docent/services/docent.service';
import { InfoComponent } from '@docent/components/info/info.component';
import { Docent } from '@core/interfaces/docent';
import { ModalService } from '@core/shared/components/modal/modal.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { ModalConfirmationService } from '@core/shared/components/modal-confirmation/modal-confirmation.service';
import { ModalConfirmationComponent } from '@core/shared/components/modal-confirmation/modal-confirmation.component';
import { ModalComponent } from '@core/shared/components/modal/modal.component';
import { Router } from '@angular/router';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';
import { ListComponent } from '@docent/components/list/list.component';
import { PaginationComponent } from '@core/shared/components/pagination/pagination.component';
import { FormComponent } from '@docent/components/form/form.component';

@Component({
  selector: 'docent-home-page',
  imports: [
    InfoComponent,
    IconComponent,
    ModalConfirmationComponent,
    ModalComponent,
    LoadingComponent,
    ListComponent,
    PaginationComponent,
    FormComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePageComponent implements OnInit, OnDestroy {
  private docentService = inject(DocentService);
  private headerService = inject(HeaderService);
  private alertService = inject(AlertService);
  private paginationService = inject(PaginationService);
  private modalService = inject(ModalService);
  private modalConfirmationService = inject(ModalConfirmationService);
  private router = inject(Router);
  private _docentInfo = signal<Docent | null>(null);

  docentInfo = computed(this._docentInfo);
  docentQuery = this.docentService.docentQuery;
  currentPage = this.paginationService.currentPage;
  isOpenModal = this.modalService.isOpen;
  isOpenModalConfirmation = this.modalConfirmationService.isOpen;

  changeData = effect(() => {
    const page = this.currentPage();
    const limit = 10;
    const expectedOffset = (page - 1) * limit;

    this.docentService.setPagination({
      limit,
      offset: expectedOffset,
      q: this.headerService.search(),
    });

    const data = this.docentQuery.data();
    const isLoading = this.docentQuery.isLoading();

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

  ngOnInit(): void {
    this.headerService.setOptions({
      title: 'Gestión de Docentes',
      subTitle: 'Administra el registro de docentes del sistema',
      placeholder: 'Buscar por nombre...',
    });
  }

  ngOnDestroy(): void {
    this.headerService.clear();
    this.alertService.close();
  }

  openModal(docent?: Docent) {
    this._docentInfo.set(docent ? docent : null);
    this.modalService.open({
      title: docent ? 'Editar Docente' : 'Crear Docente',
      subTitle: docent ? 'Modificar la información del docente' : 'Agregar un nuevo docente',
    });
  }

  onDelete(docent: Docent) {
    this.alertService.close();
    this.modalConfirmationService.open({
      title: 'Eliminar Docente',
      message: `¿Estás seguro de que deseas eliminar al docente: "${docent.name.toUpperCase()}"? Esta acción no se puede deshacer.`,
      confirmAction: () => this.delete(docent.id),
    });
  }

  private delete(id: string) {
    this.docentService.delete(id).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: 'Docente eliminado exitosamente.',
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

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { ModalConfirmationService } from '@core/shared/components/modal-confirmation/modal-confirmation.service';
import { ModalService } from '@core/shared/components/modal/modal.service';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { HeaderService } from '@dashboard/components/header/header.service';
import { ModalityService } from '@modality/services/modality.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { Modality } from '@core/interfaces/modality';
import { PaginationComponent } from '@core/shared/components/pagination/pagination.component';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';
import { TableComponent } from '@modality/components/table/table.component';
import { ModalComponent } from '@core/shared/components/modal/modal.component';
import { ModalConfirmationComponent } from '@core/shared/components/modal-confirmation/modal-confirmation.component';
import { FormComponent } from '@modality/components/form/form.component';
import { OrderType } from '@core/interfaces/pagination';

@Component({
  selector: 'modality-home-page',
  imports: [
    IconComponent,
    PaginationComponent,
    LoadingComponent,
    TableComponent,
    ModalComponent,
    ModalConfirmationComponent,
    FormComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePageComponent implements OnInit {
  private router = inject(Router);
  private headerService = inject(HeaderService);
  private modalityService = inject(ModalityService);
  private paginationService = inject(PaginationService);
  private modalService = inject(ModalService);
  private modalConfirmationService = inject(ModalConfirmationService);
  private alertService = inject(AlertService);

  private _modalityInfo = signal<Modality | null>(null);
  modalityInfo = computed(this._modalityInfo);

  modalityQuery = this.modalityService.modalityQuery;
  currentPage = this.paginationService.currentPage;

  isOpenModal = this.modalService.isOpen;
  isOpenModalConfirmation = this.modalConfirmationService.isOpen;

  changeData = effect(() => {
    const page = this.currentPage();
    const limit = 10;
    const expectedOffset = (page - 1) * limit;

    this.modalityService.setPagination({
      limit,
      offset: expectedOffset,
      order: OrderType.ASC,
      name: this.headerService.search(),
    });

    const data = this.modalityQuery.data();
    const isLoading = this.modalityQuery.isLoading();

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
      title: 'Modalidades de Posgrado',
      subTitle: 'Gestiona las modalidades académicas disponibles',
      placeholder: 'Buscar por nombre...',
    });
  }

  onDelete(modality: Modality) {
    this.alertService.close();
    this.modalConfirmationService.open({
      title: 'Eliminar modalidad de posgrado',
      message: `¿Estás seguro de que deseas eliminar la modalidad "${modality.name.toUpperCase()}"? Esta acción no se puede deshacer.`,
      confirmAction: () => this.delete(modality.id),
    });
  }

  openModal(modality?: Modality) {
    this._modalityInfo.set(modality ? modality : null);

    this.modalService.open({
      title: modality ? 'Editar modalidad de posgrado' : 'Crear nueva modalidad de posgrado',
      subTitle: modality
        ? 'Modifica la información de la modalidad de posgrado'
        : 'Rellena los campos para crear una nueva modalidad de posgrado',
    });
  }

  private delete(id: string) {
    this.modalityService.delete(id).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: 'Modalidad de posgrado eliminada exitosamente.',
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

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
import { Router } from '@angular/router';
import { FeeService } from '@fee/services/fee.service';
import { HeaderService } from '@dashboard/components/header/header.service';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { ModalService } from '@core/shared/components/modal/modal.service';
import { ModalConfirmationService } from '@core/shared/components/modal-confirmation/modal-confirmation.service';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { Fee } from '@core/interfaces/fee';
import { ModalComponent } from '@core/shared/components/modal/modal.component';
import { ModalConfirmationComponent } from '@core/shared/components/modal-confirmation/modal-confirmation.component';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';
import { TableComponent } from '@fee/components/table/table.component';
import { PaginationComponent } from '@core/shared/components/pagination/pagination.component';
import { FormComponent } from '@fee/components/form/form.component';
import { InfoComponent } from '@fee/components/info/info.component';
import { OrderType } from '@core/interfaces/pagination';

@Component({
  selector: 'fee-home-page',
  imports: [
    InfoComponent,
    IconComponent,
    ModalComponent,
    ModalConfirmationComponent,
    LoadingComponent,
    TableComponent,
    PaginationComponent,
    FormComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePageComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private feeService = inject(FeeService);
  private headerService = inject(HeaderService);
  private paginationService = inject(PaginationService);
  private modalService = inject(ModalService);
  private modalConfirmationService = inject(ModalConfirmationService);
  private alertService = inject(AlertService);

  private _feeInfo = signal<Fee | null>(null);

  feeInfo = computed(this._feeInfo);
  feeQuery = this.feeService.feeQuery;
  currentPage = this.paginationService.currentPage;

  isOpenModal = this.modalService.isOpen;
  isOpenModalConfirmation = this.modalConfirmationService.isOpen;

  changeData = effect(() => {
    const page = this.currentPage();
    const limit = 10;
    const expectedOffset = (page - 1) * limit;

    this.feeService.setPagination({
      limit,
      offset: expectedOffset,
      order: OrderType.ASC,
      modality_name: this.headerService.search(),
    });

    const data = this.feeQuery.data();
    const isLoading = this.feeQuery.isLoading();

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
      title: 'Gestión de Tarifas de Posgrado',
      subTitle: 'Administrar tarifas y valores de crédito para programas de posgrado',
      placeholder: 'Buscar por programa...',
    });
  }

  ngOnDestroy(): void {
    this.alertService.close();
    this.headerService.clear();
  }

  openModal(fee?: Fee) {
    this._feeInfo.set(fee ? fee : null);

    this.modalService.open({
      title: fee ? 'Editar tarifa de posgrado' : 'Crear nueva tarifa de posgrado',
      subTitle: fee
        ? 'Modifica la información de la tarifa'
        : 'Rellena los campos para crear una nueva tarifa',
    });
  }

  onDelete(fee: Fee) {
    this.alertService.close();
    this.modalConfirmationService.open({
      title: 'Eliminar tarifa de posgrado',
      message: `¿Estás seguro de que deseas eliminar la tarifa de la modalidad "${fee.modality.name.toUpperCase()}"? Esta acción no se puede deshacer.`,
      confirmAction: () => this.delete(fee.id),
    });
  }

  private delete(id: string) {
    this.feeService.delete(id).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: 'Tarifa eliminada exitosamente.',
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

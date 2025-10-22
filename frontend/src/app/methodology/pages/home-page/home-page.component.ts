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
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { ModalConfirmationService } from '@core/shared/components/modal-confirmation/modal-confirmation.service';
import { ModalService } from '@core/shared/components/modal/modal.service';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { HeaderService } from '@dashboard/components/header/header.service';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';
import { PaginationComponent } from '@core/shared/components/pagination/pagination.component';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { MethodologyService } from '@methodology/services/methodology.service';
import { OrderType } from '@core/interfaces/pagination';
import { TableComponent } from '@methodology/components/table/table.component';
import { Methodology } from '@core/interfaces/methodology';
import { ModalComponent } from '@core/shared/components/modal/modal.component';
import { ModalConfirmationComponent } from '@core/shared/components/modal-confirmation/modal-confirmation.component';
import { FormComponent } from '@methodology/components/form/form.component';

@Component({
  selector: 'app-home-page',
  imports: [
    IconComponent,
    LoadingComponent,
    PaginationComponent,
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
  private methodologyService = inject(MethodologyService);
  private paginationService = inject(PaginationService);
  private modalService = inject(ModalService);
  private modalConfirmationService = inject(ModalConfirmationService);
  private alertService = inject(AlertService);

  private _methodologyInfo = signal<Methodology | null>(null);
  methodologyInfo = computed(this._methodologyInfo);

  currentPage = this.paginationService.currentPage;
  methodologyQuery = this.methodologyService.methodologyQuery;

  isOpenModal = this.modalService.isOpen;
  isOpenModalConfirmation = this.modalConfirmationService.isOpen;

  changeData = effect(() => {
    const page = this.currentPage();
    const limit = 10;
    const expectedOffset = (page - 1) * limit;

    this.methodologyService.setPagination({
      limit,
      offset: expectedOffset,
      order: OrderType.ASC,
      name: this.headerService.search(),
    });

    const data = this.methodologyQuery.data();
    const isLoading = this.methodologyQuery.isLoading();

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
      title: 'Metodologías',
      subTitle: 'Gestiona las metodologías de enseñanza disponibles',
      placeholder: 'Buscar por nombre...',
    });
  }

  onDelete(methodology: Methodology) {
    this.alertService.close();
    this.modalConfirmationService.open({
      title: 'Eliminar Metodología',
      message: `¿Estás seguro de que deseas eliminar la metodología "${methodology.name.toUpperCase()}"? Esta acción no se puede deshacer.`,
      confirmAction: () => this.delete(methodology.id),
    });
  }

  openModal(methodology?: Methodology) {
    this._methodologyInfo.set(methodology ? methodology : null);

    this.modalService.open({
      title: methodology ? 'Editar Metodología' : 'Crear nueva Metodología',
      subTitle: methodology
        ? 'Modifica la información de la Metodología'
        : 'Rellena los campos para crear una nueva Metodología',
    });
  }

  private delete(id: string) {
    this.methodologyService.delete(id).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: 'Metodología eliminada exitosamente.',
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

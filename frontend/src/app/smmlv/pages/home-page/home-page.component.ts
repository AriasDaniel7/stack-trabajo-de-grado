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
import { Smmlv } from '@core/interfaces/smmlv';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { ModalConfirmationService } from '@core/shared/components/modal-confirmation/modal-confirmation.service';
import { ModalService } from '@core/shared/components/modal/modal.service';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { HeaderService } from '@dashboard/components/header/header.service';
import { InfoComponent } from '@smmlv/components/info/info.component';
import { SmmlvService } from '@smmlv/services/smmlv.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { ModalComponent } from '@core/shared/components/modal/modal.component';
import { ModalConfirmationComponent } from '@core/shared/components/modal-confirmation/modal-confirmation.component';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';
import { PaginationComponent } from '@core/shared/components/pagination/pagination.component';
import { TableComponent } from '@smmlv/components/table/table.component';
import { FormComponent } from '@smmlv/components/form/form.component';

@Component({
  selector: 'smmlv-home-page',
  imports: [
    InfoComponent,
    IconComponent,
    ModalComponent,
    ModalConfirmationComponent,
    LoadingComponent,
    PaginationComponent,
    TableComponent,
    FormComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePageComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private smmlvService = inject(SmmlvService);
  private headerService = inject(HeaderService);
  private paginationService = inject(PaginationService);
  private modalService = inject(ModalService);
  private modalConfirmationService = inject(ModalConfirmationService);
  private alertService = inject(AlertService);

  private _smmlvInfo = signal<Smmlv | null>(null);

  smmlvQuery = this.smmlvService.smmlvQuery;
  currentPage = this.paginationService.currentPage;
  smmlvInfo = computed(this._smmlvInfo);

  isOpenModal = this.modalService.isOpen;
  isOpenModalConfirmation = this.modalConfirmationService.isOpen;

  changeData = effect(() => {
    const page = this.currentPage();
    const limit = 10;
    const expectedOffset = (page - 1) * limit;

    this.smmlvService.setPagination({
      limit,
      offset: expectedOffset,
      year: this.headerService.search(),
    });

    const data = this.smmlvQuery.data();
    const isLoading = this.smmlvQuery.isLoading();

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
      title: 'Gestión de SMMLV',
      subTitle: 'Administrar valores del Salario Mínimo Mensual Legal Vigente',
      placeholder: 'Buscar por año...',
    });
  }

  ngOnDestroy(): void {
    this.alertService.close();
    this.headerService.clear();
  }

  onDelete(smmlv: Smmlv) {
    this.modalConfirmationService.open({
      title: 'Elimina SMMLV',
      message: `¿Estás seguro de eliminar el valor del SMMLV del año "${smmlv.year}"?`,
      confirmAction: () => this.delete(smmlv.id),
    });
  }

  openModal(smmlv?: Smmlv) {
    this._smmlvInfo.set(smmlv ? smmlv : null);

    this.modalService.open({
      title: smmlv ? 'Editar Valor SMMLV' : 'Agregar Valor SMMLV',
      subTitle: smmlv ? 'Modifique el valor del SMMLV' : 'Ingrese el nuevo valor del SMMLV',
    });
  }

  private delete(id: string) {
    this.alertService.close();
    this.smmlvService.delete(id).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: 'SMMLV eliminado con éxito',
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

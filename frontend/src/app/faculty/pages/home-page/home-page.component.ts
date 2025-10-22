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
import { HeaderService } from '@dashboard/components/header/header.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { ModalService } from '@core/shared/components/modal/modal.service';
import { ModalConfirmationService } from '@core/shared/components/modal-confirmation/modal-confirmation.service';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { FacultyService } from '@faculty/services/faculty.service';
import { Faculty } from '@core/interfaces/faculty';
import { OrderType } from '@core/interfaces/pagination';
import { ModalComponent } from '@core/shared/components/modal/modal.component';
import { ModalConfirmationComponent } from '@core/shared/components/modal-confirmation/modal-confirmation.component';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';
import { PaginationComponent } from '@core/shared/components/pagination/pagination.component';
import { TableComponent } from '@faculty/components/table/table.component';
import { FormComponent } from '@faculty/components/form/form.component';

@Component({
  selector: 'app-home-page',
  imports: [
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
export default class HomePageComponent implements OnInit {
  private router = inject(Router);
  private headerService = inject(HeaderService);
  private paginationService = inject(PaginationService);
  private modalService = inject(ModalService);
  private modalConfirmationService = inject(ModalConfirmationService);
  private alertService = inject(AlertService);
  private facultyService = inject(FacultyService);

  private _facultyInfo = signal<Faculty | null>(null);
  facultyInfo = computed(this._facultyInfo);

  currentPage = this.paginationService.currentPage;
  facultyQuery = this.facultyService.facultyQuery;

  isOpenModal = this.modalService.isOpen;
  isOpenModalConfirmation = this.modalConfirmationService.isOpen;

  changeData = effect(() => {
    const page = this.currentPage();
    const limit = 10;
    const expectedOffset = (page - 1) * limit;

    this.facultyService.setPagination({
      limit,
      offset: expectedOffset,
      order: OrderType.ASC,
      name: this.headerService.search(),
    });

    const data = this.facultyQuery.data();
    const isLoading = this.facultyQuery.isLoading();

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
      title: 'Facultades',
      subTitle: 'Gestión de facultades',
      placeholder: 'Buscar por nombre...',
    });
  }

  openModal(faculty?: Faculty) {
    this._facultyInfo.set(faculty ? faculty : null);

    this.modalService.open({
      title: faculty ? 'Editar Facultad' : 'Crear Nueva Facultad',
      subTitle: faculty
        ? 'Modifica la información de la facultad'
        : 'Rellena los campos para crear una nueva facultad',
    });
  }

  onDelete(faculty: Faculty) {
    this.alertService.close();
    this.modalConfirmationService.open({
      title: 'Eliminar Facultad',
      message: `¿Estás seguro de que deseas eliminar la facultad "${faculty.name.toUpperCase()}"? Esta acción no se puede deshacer.`,
      confirmAction: () => this.delete(faculty.id),
    });
  }

  private delete(id: string) {
    this.facultyService.delete(id).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: 'Facultad eliminada exitosamente.',
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

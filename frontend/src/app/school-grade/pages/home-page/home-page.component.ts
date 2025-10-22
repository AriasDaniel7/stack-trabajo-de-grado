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
import { HeaderService } from '@dashboard/components/header/header.service';
import { InfoComponent } from '@school-grade/components/info/info.component';
import { SchoolGradeService } from '@school-grade/services/school-grade.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';
import { PaginationComponent } from '@core/shared/components/pagination/pagination.component';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { Router } from '@angular/router';
import { TableComponent } from '@school-grade/components/table/table.component';
import { SchoolGrade } from '@core/interfaces/school-grade';
import { ModalService } from '@core/shared/components/modal/modal.service';
import { ModalConfirmationService } from '@core/shared/components/modal-confirmation/modal-confirmation.service';
import { ModalComponent } from '@core/shared/components/modal/modal.component';
import { ModalConfirmationComponent } from '@core/shared/components/modal-confirmation/modal-confirmation.component';
import { FormComponent } from '@school-grade/components/form/form.component';

@Component({
  selector: 'school-grade-home-page',
  imports: [
    InfoComponent,
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
export default class HomePageComponent implements OnInit, OnDestroy {
  private schoolGService = inject(SchoolGradeService);
  private headerService = inject(HeaderService);
  private alertService = inject(AlertService);
  private paginationService = inject(PaginationService);
  private router = inject(Router);
  private _schoolGradeInfo = signal<SchoolGrade | null>(null);
  private modalService = inject(ModalService);
  private modalConfirmationService = inject(ModalConfirmationService);

  schoolGQuery = this.schoolGService.schoolGQuery;
  currentPage = this.paginationService.currentPage;
  isOpenModal = this.modalService.isOpen;
  isOpenModalConfirmation = this.modalConfirmationService.isOpen;
  schoolGradeInfo = computed(this._schoolGradeInfo);

  changeData = effect(() => {
    const page = this.currentPage();
    const limit = 10;
    const expectedOffset = (page - 1) * limit;

    this.schoolGService.setPagination1({
      limit,
      offset: expectedOffset,
      name: this.headerService.search(),
    });

    const data = this.schoolGQuery.data();
    const isLoading = this.schoolGQuery.isLoading();

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

  openModal(schoolGrade?: SchoolGrade) {
    this._schoolGradeInfo.set(schoolGrade ? schoolGrade : null);

    this.modalService.open({
      title: schoolGrade ? 'Editar nivel académico' : 'Agregar nivel académico',
      subTitle: schoolGrade
        ? 'Modifica los datos del nivel académico'
        : 'Llena los datos para agregar un nuevo nivel académico',
    });
  }

  onDelete(schoolGrade: SchoolGrade) {
    this.modalConfirmationService.open({
      title: 'Eliminar nivel académico',
      message: `¿Estás seguro de eliminar el nivel académico "${schoolGrade.name.toUpperCase()}"?`,
      confirmAction: () => this.delete(schoolGrade.id),
    });
  }

  ngOnInit(): void {
    this.headerService.setOptions({
      title: 'Niveles Académicos',
      subTitle: 'Gestiona los niveles educativos del sistema',
      placeholder: 'Buscar por nombre...',
    });
  }

  ngOnDestroy(): void {
    this.headerService.clear();
    this.alertService.close();
  }

  private delete(id: string) {
    this.alertService.close();
    this.schoolGService.delete(id).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: 'Nivel académico eliminado con éxito',
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

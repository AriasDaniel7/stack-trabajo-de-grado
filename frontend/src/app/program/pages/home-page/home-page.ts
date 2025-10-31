import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  untracked,
} from '@angular/core';
import { HeaderService } from '@dashboard/components/header/header.service';
import { InfoComponent } from '@program/components/info/info.component';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { Router, RouterLink } from '@angular/router';
import { ProgramService } from '@program/services/program.service';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { TableProgram } from '@program/components/table-program/table-program';
import { PaginationComponent } from '@core/shared/components/pagination/pagination.component';
import { MethodologyService } from '@methodology/services/methodology.service';
import { OrderType } from '@core/interfaces/pagination';
import { TitleCasePipe } from '@angular/common';
import { FacultyService } from '@faculty/services/faculty.service';
import { ModalityService } from '@modality/services/modality.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { LocalStorageService } from '@core/services/local-storage.service';
import { ModalService } from '@core/shared/components/modal/modal.service';
import { ModalConfirmationService } from '@core/shared/components/modal-confirmation/modal-confirmation.service';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { Program } from '@core/interfaces/program';
import { ModalConfirmationComponent } from '@core/shared/components/modal-confirmation/modal-confirmation.component';

@Component({
  selector: 'app-home-page',
  imports: [
    InfoComponent,
    IconComponent,
    RouterLink,
    TableProgram,
    PaginationComponent,
    TitleCasePipe,
    ReactiveFormsModule,
    ModalConfirmationComponent,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePage implements OnInit, OnDestroy {
  private headerService = inject(HeaderService);
  private programService = inject(ProgramService);
  private methodologyService = inject(MethodologyService);
  private facultySevice = inject(FacultyService);
  private modalityService = inject(ModalityService);
  private paginationService = inject(PaginationService);
  private localStorageService = inject(LocalStorageService);
  private modalConfirmationService = inject(ModalConfirmationService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  programAllInternal = this.programService.programAllInternalQuery;
  currentPage = this.paginationService.currentPage;
  methodologiesQuery = this.methodologyService.methodologyQuery;
  modalitiesQuery = this.modalityService.modalityQuery;
  facultiesQuery = this.facultySevice.facultyQuery;

  filterForm = this.fb.group({
    idMethodology: [null],
    idFaculty: [null],
    idModality: [null],
    name: [null],
    unity: [null],
    workday: [null],
  });

  idMethodology = toSignal(this.filterForm.controls.idMethodology.valueChanges);
  idModality = toSignal(this.filterForm.controls.idModality.valueChanges);
  idFaculty = toSignal(this.filterForm.controls.idFaculty.valueChanges);
  name = toSignal(this.filterForm.controls.name.valueChanges);
  unity = toSignal(this.filterForm.controls.unity.valueChanges);
  workday = toSignal(this.filterForm.controls.workday.valueChanges);

  changeData = effect(() => {
    const page = this.currentPage();
    const limit = 10;
    const expectedOffset = (page - 1) * limit;
    const idMethodology = this.idMethodology();
    const idModality = this.idModality();
    const idFaculty = this.idFaculty();
    const name = this.name();
    const unity = this.unity();
    const workday = this.workday();

    this.programService.setPaginationProgramAllInternal({
      limit,
      offset: expectedOffset,
      idMethodology: idMethodology ? idMethodology : undefined,
      idModality: idModality ? idModality : undefined,
      idFaculty: idFaculty ? idFaculty : undefined,
      name: name ? name : undefined,
      unity: unity ? unity : undefined,
      workday: workday ? workday : undefined,
    });

    const data = this.programAllInternal.data();
    const isLoading = this.programAllInternal.isLoading();

    if (!isLoading && data) {
      if (data.data.length === 0 && data.pages > 0) {
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
    if (this.localStorageService.getItem('program-home-page-filters')) {
      const savedFilters = JSON.parse(
        this.localStorageService.getItem('program-home-page-filters')!
      );
      this.filterForm.reset(savedFilters);
    }

    this.methodologyService.setPagination({
      limit: 100,
      offset: 0,
      order: OrderType.ASC,
    });

    this.facultySevice.setPagination({
      limit: 100,
      offset: 0,
      order: OrderType.ASC,
    });

    this.modalityService.setPagination({
      limit: 100,
      offset: 0,
      order: OrderType.ASC,
    });

    this.headerService.setOptions({
      title: 'Gestión de Programas',
      subTitle: 'Administrar programas de posgrado del sistema',
      showSearch: false,
    });
  }

  ngOnDestroy(): void {
    this.localStorageService.setItem(
      'program-home-page-filters',
      JSON.stringify(this.filterForm.value)
    );
  }

  onDelete(program: Program) {
    this.alertService.close();
    this.modalConfirmationService.open({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el programa "${program.name.toUpperCase()} | ${
        program.faculty ? program.faculty.toUpperCase() : 'Sin Facultad'
      } | ${program.unity.toUpperCase()} | ${program.workday.toUpperCase()} | ${program.methodology.toUpperCase()} | ${program.modality.toUpperCase()}"? Esta acción no se puede deshacer.`,
      confirmAction: () => this.deleteProgramPlacement(program.idProgramPlacement!),
    });
  }

  private deleteProgramPlacement(id: string) {
    this.programService.deletePlacement(id).subscribe({
      next: () => {
        this.alertService.open({
          message: 'Programa eliminado exitosamente.',
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

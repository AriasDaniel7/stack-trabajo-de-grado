import { TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormUtil } from '@core/utils/form';
import { MethodologyService } from '@methodology/services/methodology.service';
import { ModalityService } from '@modality/services/modality.service';
import { SchoolGradeService } from '@school-grade/services/school-grade.service';
import { ProgramService } from '@program/services/program.service';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { TableExisting } from '../table-existing/table-existing';
import { PaginationComponent } from '@core/shared/components/pagination/pagination.component';
import { ProgramExisting } from '@core/interfaces/program';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';
import { PensumList } from '../pensum-list/pensum-list';
import { Pensum } from '@core/interfaces/pensum';

@Component({
  selector: 'program-form',
  imports: [
    ReactiveFormsModule,
    TitleCasePipe,
    TableExisting,
    PaginationComponent,
    IconComponent,
    LoadingComponent,
    PensumList,
  ],
  templateUrl: './form.html',
  styleUrl: './form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Form implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private schoolGradeService = inject(SchoolGradeService);
  private methodologyService = inject(MethodologyService);
  private modalityService = inject(ModalityService);
  private programService = inject(ProgramService);
  private paginationService = inject(PaginationService);

  schoolGQuery = this.schoolGradeService.schoolGExistingQuery;
  methodologyQuery = this.methodologyService.methodologyExistingQuery;
  modalityQuery = this.modalityService.modalityExistingQuery;
  programQuery = this.programService.programExistingQuery;
  currentPage = this.paginationService.currentPage;
  pensumQuery = this.programService.pensumQuery;

  searchTerm = signal('');
  programSelected = signal<ProgramExisting | null>(null);
  pensumSelected = signal<Pensum | null>(null);

  formUtil = FormUtil;

  myForm = this.fb.group({
    idEducationalLevel: [null],
    idMethodology: [null],
    idModality: [null],
  });

  onFormChanges = effect(() => {
    const idEducationalLevel = this.idEducationalLevel();
    const idMethodology = this.idMethodology();
    const idModality = this.idModality();
    const page = this.currentPage();
    const expectedOffset = (page - 1) * 10;

    if (idEducationalLevel) {
      untracked(() => {
        this.modalityService.setPaginationExisting({
          limit: 100,
          offset: 0,
          idEducationalLevel,
        });
      });
    }

    this.programService.setPaginationProgramExisting({
      limit: 10,
      offset: expectedOffset,
      idEducationalLevel: idEducationalLevel || undefined,
      idMethodology: idMethodology || undefined,
      idModality: idModality || undefined,
      filter: this.searchTerm() || undefined,
    });

    const data = this.programQuery.data();
    const isLoading = this.programQuery.isLoading();

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

  onSelectProgram = effect(() => {
    const program = this.programSelected();

    if (program) {
      untracked(() => {
        this.programService.setPaginationPensumByProgramId({
          idProgram: program.id,
          limit: 100,
          offset: 0,
        });
      });
    }

    if (program === null) {
      this.programService.setPaginationPensumByProgramId();
    }
  });

  idEducationalLevel = toSignal(
    this.myForm.controls.idEducationalLevel.valueChanges.pipe(
      tap(() => {
        this.myForm.controls.idModality.setValue(null);
      })
    )
  );

  idMethodology = toSignal(this.myForm.controls.idMethodology.valueChanges);
  idModality = toSignal(this.myForm.controls.idModality.valueChanges);

  ngOnInit(): void {
    this.initEducationalLevels();
    this.initMethodologies();
  }

  private initMethodologies() {
    this.methodologyService.setPagination({
      limit: 100,
      offset: 0,
    });
  }

  private initEducationalLevels() {
    this.schoolGradeService.setPagination2({
      limit: 100,
      offset: 0,
    });
  }

  deleteSelection() {
    this.programSelected.set(null);
    this.pensumSelected.set(null);
  }
}

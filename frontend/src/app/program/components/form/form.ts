import { JsonPipe, LowerCasePipe, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtil } from '@core/utils/form';
import { MethodologyService } from '@methodology/services/methodology.service';
import { ModalityService } from '@modality/services/modality.service';
import { SchoolGradeService } from '@school-grade/services/school-grade.service';
import { tap } from 'rxjs';
import { TableExisting } from '../table-existing/table-existing';
import { ProgramService } from '@program/services/program.service';
import { PaginationComponent } from '@core/shared/components/pagination/pagination.component';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { Router } from '@angular/router';
import { ProgramExisting } from '@core/interfaces/program';
import { IconComponent } from "@core/shared/components/icon/icon.component";

@Component({
  selector: 'program-form',
  imports: [
    ReactiveFormsModule,
    LowerCasePipe,
    TitleCasePipe,
    JsonPipe,
    TableExisting,
    PaginationComponent,
    IconComponent
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

  programSelected = signal<ProgramExisting | null>(null);
  searchTerm = signal('');

  schoolGQuery = this.schoolGradeService.schoolGExistingQuery;
  methodologyQuery = this.methodologyService.methodologyExistingQuery;
  modalityQuery = this.modalityService.modalityExistingQuery;
  programQuery = this.programService.programExistingQuery;
  currentPage = this.paginationService.currentPage;

  formUtil = FormUtil;

  myForm = this.fb.group({
    idEducationalLevel: [null],
    idMethodology: [null],
    idModality: [null],
  });

  onEducationalLevelChange = toSignal(
    this.myForm.controls.idEducationalLevel.valueChanges.pipe(
      tap(() => {
        this.myForm.controls.idModality.setValue(null);
      })
    )
  );

  onMethodologyChange = toSignal(this.myForm.controls.idMethodology.valueChanges);
  onModalityChange = toSignal(this.myForm.controls.idModality.valueChanges);

  onFormChanges = effect(() => {
    const idEducationalLevel = this.onEducationalLevelChange();
    const idMethodology = this.onMethodologyChange();
    const idModality = this.onModalityChange();
    const page = this.currentPage();
    const limit = 10;
    const expectedOffset = (page - 1) * limit;

    if (idEducationalLevel) {
      untracked(() => {
        this.modalityService.setPaginationExisting({
          limit: 100,
          offset: 0,
          idEducationalLevel,
        });
      });
    }

    this.programService.setPaginationExisting({
      limit,
      offset: expectedOffset,
      idEducationalLevel: idEducationalLevel ? idEducationalLevel : undefined,
      idMethodology: idMethodology ? idMethodology : undefined,
      idModality: idModality ? idModality : undefined,
      filter: this.searchTerm(),
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

  ngOnInit(): void {
    this.initSchoolGradesExisting();
    this.initMethodologiesExisting();
  }

  private initMethodologiesExisting() {
    this.methodologyService.setPagination({
      limit: 100,
      offset: 0,
    });
  }

  private initSchoolGradesExisting() {
    this.schoolGradeService.setPagination2({
      limit: 100,
      offset: 0,
    });
  }
}

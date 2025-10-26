import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MethodologyExistingResponse } from '@core/interfaces/methodology';
import { SchoolGradeExistingResponse } from '@core/interfaces/school-grade';
import { HeaderService } from '@dashboard/components/header/header.service';
import { Form } from '@program/components/form/form';
import { SchoolGradeService } from '@school-grade/services/school-grade.service';
import { map } from 'rxjs';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';
import { ModalityExistingResponse } from '@core/interfaces/modality';
import { ProgramService } from '@program/services/program.service';
import { SmmlvService } from '@smmlv/services/smmlv.service';
import { SmmlvResponse } from '@core/interfaces/smmlv';
import { FeeService } from '@fee/services/fee.service';
import { FeeResponse } from '@core/interfaces/fee';

@Component({
  selector: 'app-program-detail',
  imports: [Form, LoadingComponent],
  templateUrl: './program-detail.html',
  styleUrl: './program-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgramDetail implements OnInit {
  private headerService = inject(HeaderService);
  private activatedRoute = inject(ActivatedRoute);
  private schoolGradeService = inject(SchoolGradeService);
  private programService = inject(ProgramService);
  private smmlvService = inject(SmmlvService);
  private feeService = inject(FeeService);

  educationLevels = signal<SchoolGradeExistingResponse | null>(null);
  smmlvs = signal<SmmlvResponse | null>(null);
  fees = signal<FeeResponse | null>(null);
  isLoading = signal(true);

  educationLevelPostgrado = computed(() => {
    const levels = this.educationLevels();

    if (levels) {
      return levels.data.find((level) => level.description.toLowerCase() === 'postgrado') || null;
    }

    return null;
  });

  programId = toSignal(this.activatedRoute.params.pipe(map((params) => params['id'])));

  async ngOnInit() {
    this.headerService.setOptions({
      title: this.programId() === 'new' ? 'Registrar Programa' : 'Detalle del Programa',
      subTitle: 'Administrar la información del programa seleccionado',
      showSearch: false,
    });

    const [educationalLevels, smmlvs, fees] = await Promise.all([
      this.schoolGradeService.getEducationalLevels({
        limit: 100,
        offset: 0,
      }),
      this.smmlvService.getSmmlvs({
        limit: 100,
        offset: 0,
      }),
      this.feeService.getFees({
        limit: 100,
        offset: 0,
      }),
    ]);

    this.educationLevels.set(educationalLevels);
    this.smmlvs.set(smmlvs);
    this.fees.set(fees);

    if (this.educationLevelPostgrado()) {
      await this.programService.prefetchProgramExisting({
        idEducationalLevel: this.educationLevelPostgrado()!.id,
        limit: 10,
        offset: 0,
      });
    }

    this.isLoading.set(false);
  }
}

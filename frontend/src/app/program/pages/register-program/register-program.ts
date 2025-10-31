import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FeeResponse } from '@core/interfaces/fee';
import { SchoolGradeExistingResponse } from '@core/interfaces/school-grade';
import { SmmlvResponse } from '@core/interfaces/smmlv';
import { HeaderService } from '@dashboard/components/header/header.service';
import { FeeService } from '@fee/services/fee.service';
import { SchoolGradeService } from '@school-grade/services/school-grade.service';
import { SmmlvService } from '@smmlv/services/smmlv.service';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';
import { FormRegisterProgram } from '@program/components/form-register-program/form-register-program';

@Component({
  selector: 'app-register-program',
  imports: [LoadingComponent, FormRegisterProgram],
  templateUrl: './register-program.html',
  styleUrl: './register-program.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterProgram {
  private headerService = inject(HeaderService);
  private schoolGradeService = inject(SchoolGradeService);
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

  async ngOnInit() {
    this.headerService.setOptions({
      title: 'Registrar Programa',
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
    this.isLoading.set(false);
  }
}

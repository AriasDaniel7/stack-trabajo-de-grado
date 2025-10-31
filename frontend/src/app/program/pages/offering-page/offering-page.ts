import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Offering } from '@core/interfaces/program';
import { HeaderService } from '@dashboard/components/header/header.service';
import { ProgramService } from '@program/services/program.service';
import { map } from 'rxjs';
import { CardProgram } from '@program/components/card-program/card-program';
import { CardPensum } from '@program/components/card-pensum/card-pensum';
import { FormOffering } from '@program/components/form-offering/form-offering';
import { SmmlvService } from '@smmlv/services/smmlv.service';
import { SmmlvResponse } from '@core/interfaces/smmlv';
import { FeeService } from '@fee/services/fee.service';
import { FeeResponse } from '@core/interfaces/fee';

@Component({
  selector: 'app-offering-page',
  imports: [CardProgram, CardPensum, FormOffering],
  templateUrl: './offering-page.html',
  styleUrl: './offering-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OfferingPage implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private programService = inject(ProgramService);
  private headerService = inject(HeaderService);
  private smmlvService = inject(SmmlvService);
  private feeService = inject(FeeService);
  private titleCase = new TitleCasePipe();
  private router = inject(Router);

  offering = signal<Offering | null>(null);
  smmlvs = signal<SmmlvResponse | null>(null);
  fees = signal<FeeResponse | null>(null);

  idProgramOffering = toSignal<string>(
    this.activatedRoute.params.pipe(map((params) => params['idProgramOffering']))
  );

  async ngOnInit() {
    if (this.idProgramOffering()) {
      let offering: Offering | null = null;
      offering = await this.programService.offeringById(this.idProgramOffering()!);

      if (!offering) {
        this.router.navigate(['/dashboard/programs/program-management']);
        return;
      }

      const [smmlvs, fees] = await Promise.all([
        this.smmlvService.getSmmlvs({
          limit: 100,
          offset: 0,
        }),
        this.feeService.getFees({
          limit: 100,
          offset: 0,
        }),
      ]);

      this.offering.set(offering);
      this.smmlvs.set(smmlvs);
      this.fees.set(fees);
    }

    this.headerService.setOptions({
      title: `${this.titleCase.transform(this.offering()?.program.name)}`,
      subTitle: `Oferta Académica - Cohorte: ${this.offering()?.cohort} Semestre: ${
        this.offering()?.semester
      }`,
      showSearch: false,
    });
  }
}

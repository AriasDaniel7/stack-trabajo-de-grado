import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { OfferingResponse } from '@core/interfaces/program';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'program-info-offering',
  imports: [IconComponent],
  templateUrl: './info-offering.html',
  styleUrl: './info-offering.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoOffering {
  offeringResponse = input<OfferingResponse>();

  countOfferingWithCodeCDP(): number {
    const offerings = this.offeringResponse()?.data || [];
    return offerings.filter((offering) => offering.codeCDP).length;
  }
}

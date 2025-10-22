import { CurrencyPipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FeeResponse } from '@core/interfaces/fee';
import { SmmlvResponse } from '@core/interfaces/smmlv';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { SmmlvService } from '@smmlv/services/smmlv.service';

@Component({
  selector: 'fee-info',
  imports: [IconComponent, CurrencyPipe, TitleCasePipe, DecimalPipe],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent implements OnInit {
  private smmlvService = inject(SmmlvService);

  feeResponse = input<FeeResponse>();

  smmlvQuery = this.smmlvService.smmlvQuery;
  yearCurrent = signal(new Date().getFullYear());

  smmlv = computed(() => {
    if (!this.smmlvQuery.data()?.data) return null;
    if (this.smmlvQuery.data()!.data.length === 0) return null;

    if (this.smmlvQuery.data()!.data.length > 0) {
      return this.smmlvQuery.data()!.data[0];
    }
    return null;
  });

  higherRate = computed(() => {
    const rates = this.feeResponse();
    if (rates && rates.data.length > 0) {
      return rates.data.reduce((max, fee) => (fee.factor_smmlv > max.factor_smmlv ? fee : max));
    }
    return null;
  });

  calculateHigherRate = computed(() => {
    return this.higherRate() && this.smmlv()
      ? this.higherRate()!.factor_smmlv * this.smmlv()!.value
      : 0;
  });

  averageCredit = computed(() => {
    const rates = this.feeResponse();
    if (rates && rates.data.length > 0) {
      const total = rates.data.reduce((sum, fee) => sum + fee.credit_value_smmlv, 0);
      return total / rates.data.length;
    }
    return 0;
  });

  ngOnInit(): void {
    this.smmlvService.setPagination({
      limit: 1,
      offset: 0,
      year: this.yearCurrent().toString(),
    });
  }
}

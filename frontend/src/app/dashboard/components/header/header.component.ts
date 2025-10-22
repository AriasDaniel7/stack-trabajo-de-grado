import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { HeaderService } from './header.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'dashboard-header',
  imports: [IconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private headerService = inject(HeaderService);

  onMenu = output<void>();

  options = this.headerService.options;

  openMenu() {
    this.onMenu.emit();
  }

  setSearch(search: string) {
    this.headerService.setSearch(search.trim().toLowerCase());
  }
}

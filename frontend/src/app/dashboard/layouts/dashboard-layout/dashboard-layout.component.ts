import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';
import { MenuComponent } from '@dashboard/components/menu/menu.component';
import { HeaderComponent } from '@dashboard/components/header/header.component';
import { FooterComponent } from "@core/shared/components/footer/footer.component";

@Component({
  selector: 'dashboard-layout',
  imports: [LoadingComponent, MenuComponent, HeaderComponent, RouterOutlet, FooterComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayoutComponent {
  private authService = inject(AuthService);
  status = this.authService.authStatus;
  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }
}

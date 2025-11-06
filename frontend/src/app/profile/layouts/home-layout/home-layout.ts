import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';
import { HeaderService } from '@dashboard/components/header/header.service';
import { MenuComponent } from '@dashboard/components/menu/menu.component';
import { HeaderComponent } from '@dashboard/components/header/header.component';
import { FooterComponent } from '@core/shared/components/footer/footer.component';

@Component({
  selector: 'profile-home-layout',
  imports: [LoadingComponent, RouterOutlet, MenuComponent, HeaderComponent, FooterComponent],
  templateUrl: './home-layout.html',
  styleUrl: './home-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeLayout implements OnInit {
  private authService = inject(AuthService);
  private headerService = inject(HeaderService);

  status = this.authService.authStatus;
  isMenuOpen = signal(false);
  optionsHeader = this.headerService.options;

  toggleMenu() {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  ngOnInit(): void {
    this.headerService.setOptions({
      title: 'Mi Perfil',
      subTitle: 'Gestiona tu información personal y configuración de cuenta',
      showSearch: false,
    });
  }
}

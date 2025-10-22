import { DatePipe, I18nSelectPipe, SlicePipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';

@Component({
  selector: 'dashboard-menu',
  imports: [
    RouterLink,
    RouterLinkActive,
    DatePipe,
    TitleCasePipe,
    UpperCasePipe,
    I18nSelectPipe,
    IconComponent,
    SlicePipe,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  private authService = inject(AuthService);

  onClick = output<void>();
  user = this.authService.user;

  openMenuIndex = signal<number | null>(null);

  listItem = signal([
    {
      icon: 'home',
      label: 'Panel Principal',
      route: '',
    },
    {
      icon: 'layers',
      label: 'Niveles Académicos',
      route: 'school-grades',
    },
    {
      icon: 'user-check',
      label: 'Docentes',
      route: 'docents',
    },
    {
      icon: 'seminary',
      label: 'Seminarios',
      route: 'seminars',
    },
    {
      icon: 'smmlv',
      label: 'SMMLV',
      route: 'smmlvs',
    },
    {
      icon: 'program',
      label: 'Programas',
      route: 'programs',
      subMenu: [
        {
          icon: '',
          label: 'Facultades',
          route: 'faculties',
        },
        {
          icon: '',
          label: 'Metodologías',
          route: 'methodologies',
        },
        {
          icon: '',
          label: 'Gestión de Programas',
          route: 'program-management',
        },
      ],
    },
    {
      icon: 'fee',
      label: 'Tarifas de Posgrado',
      route: 'rates',
    },
    {
      icon: 'modality',
      label: 'Modalidades',
      route: 'modalities',
    },
  ]);

  rolMap = {
    admin: 'Administrador',
    user: 'Usuario',
  };

  customDate = signal(new Date());

  tickingDateEffect = effect((onCleanup) => {
    const interval = setInterval(() => {
      this.customDate.set(new Date());
    }, 1000);

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  toggleSubMenu(index: number): void {
    this.openMenuIndex.update((currentIndex) => (currentIndex === index ? null : index));
  }
}

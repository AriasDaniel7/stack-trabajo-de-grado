import { DatePipe, I18nSelectPipe, SlicePipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';

interface SubMenuItem {
  icon: string;
  label: string;
  route: string;
  skipParentRoute?: boolean;
}

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  subMenu?: SubMenuItem[];
}

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
  private router = inject(Router);

  onClick = output<void>();
  user = this.authService.user;

  openMenuIndexes = signal<Set<number>>(new Set([0, 1, 2]));

  listItem = signal<MenuItem[]>([
    {
      icon: 'layers',
      label: 'Niveles',
      subMenu: [
        {
          icon: '',
          label: 'Niveles Académicos',
          route: 'school-grades',
        },
        {
          icon: '',
          label: 'Modalidades',
          route: 'modalities',
        },
      ],
    },
    {
      icon: 'document',
      label: 'Archivos',
      subMenu: [
        {
          icon: '',
          label: 'Docentes',
          route: 'docents',
        },
        {
          icon: '',
          label: 'Tarifas de Posgrado',
          route: 'rates',
        },
        {
          icon: '',
          label: 'SMMLV',
          route: 'smmlvs',
        },
      ],
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
          label: 'Programas de posgrado',
          route: 'program-management',
        },
        {
          icon: '',
          label: 'Asignación de Seminarios',
          route: 'seminars',
          skipParentRoute: true,
        },
      ],
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
    this.openMenuIndexes.update((indexes) => {
      const newIndexes = new Set(indexes);
      if (newIndexes.has(index)) {
        newIndexes.delete(index);
      } else {
        newIndexes.add(index);
      }
      return newIndexes;
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: (res) => {
        if (res) {
          this.router.navigateByUrl('/auth/login');
        }
      },
    });
  }
}

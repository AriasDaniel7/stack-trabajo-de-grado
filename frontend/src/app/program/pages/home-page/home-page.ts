import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { HeaderService } from '@dashboard/components/header/header.service';
import { InfoComponent } from '@program/components/info/info.component';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [InfoComponent, IconComponent, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePage implements OnInit {
  private headerService = inject(HeaderService);

  ngOnInit(): void {
    this.headerService.setOptions({
      title: 'Gestión de Programas',
      subTitle: 'Administrar programas de posgrado del sistema',
      placeholder: 'Buscar programa por nombre...',
    });
  }
}

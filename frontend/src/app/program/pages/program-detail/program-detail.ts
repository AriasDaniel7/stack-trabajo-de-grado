import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { HeaderService } from '@dashboard/components/header/header.service';
import { Form } from '@program/components/form/form';
import { map } from 'rxjs';

@Component({
  selector: 'app-program-detail',
  imports: [Form],
  templateUrl: './program-detail.html',
  styleUrl: './program-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgramDetail implements OnInit {
  private headerService = inject(HeaderService);
  private activatedRoute = inject(ActivatedRoute);

  programId = toSignal(this.activatedRoute.params.pipe(map((params) => params['id'])));

  ngOnInit(): void {
    this.headerService.setOptions({
      title: this.programId() === 'new' ? 'Crear Programa' : 'Detalle del Programa',
      subTitle: 'Administrar la información del programa seleccionado',
      showSearch: false,
    });
  }
}

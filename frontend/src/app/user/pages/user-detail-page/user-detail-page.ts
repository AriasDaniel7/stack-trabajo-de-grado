import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@core/interfaces/user';
import { HeaderService } from '@dashboard/components/header/header.service';
import { UserService } from '@user/services/user.service';
import { map } from 'rxjs';
import { Card } from '@user/components/card/card';
import { FormUser } from '@user/components/form-user/form-user';
import { FormUpdatePassword } from '@user/components/form-update-password/form-update-password';
import { ModalConfirmationService } from '@core/shared/components/modal-confirmation/modal-confirmation.service';
import { CreateUser } from "@user/components/create-user/create-user";

@Component({
  selector: 'app-user-detail-page',
  imports: [Card, FormUser, FormUpdatePassword, CreateUser],
  templateUrl: './user-detail-page.html',
  styleUrl: './user-detail-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UserDetailPage implements OnInit {
  private headerService = inject(HeaderService);
  private activatedRoute = inject(ActivatedRoute);
  private userService = inject(UserService);
  private router = inject(Router);

  user = signal<User | null>(null);
  isLoading = signal<boolean>(true);

  idUser = toSignal<string>(this.activatedRoute.params.pipe(map((params) => params['id'])));

  loadUser = effect(async () => {
    const idUser = this.idUser();

    if (!idUser) {
      this.router.navigate(['/dashboard/users']);
      return;
    }

    if (idUser && idUser !== 'new') {
      const userData = await this.userService.getUserById(idUser);
      this.user.set(userData);
      this.isLoading.set(false);

      if (!userData) {
        this.router.navigate(['/dashboard/users']);
      }
    }

    if (idUser === 'new') {
      this.isLoading.set(false);
    }
  });

  ngOnInit(): void {
    this.headerService.setOptions({
      title: 'Gestión de Usuarios',
      subTitle: 'Administra los usuarios del sistema',
      showSearch: false,
    });
  }
}

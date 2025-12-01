import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PaginationService } from '@core/shared/components/pagination/pagination.service';
import { HeaderService } from '@dashboard/components/header/header.service';
import { Info } from '@user/components/info/info';
import { UserService } from '@user/services/user.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { Table } from '@user/components/table/table';
import { PaginationComponent } from '@core/shared/components/pagination/pagination.component';
import { ModalConfirmationComponent } from '@core/shared/components/modal-confirmation/modal-confirmation.component';
import { User } from '@core/interfaces/user';
import { ModalConfirmationService } from '@core/shared/components/modal-confirmation/modal-confirmation.service';
import { AlertService } from '@core/shared/components/alert/alert.service';

@Component({
  selector: 'app-home-page',
  imports: [
    Info,
    IconComponent,
    Table,
    PaginationComponent,
    ModalConfirmationComponent,
    RouterLink,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePage {
  private headerService = inject(HeaderService);
  private userService = inject(UserService);
  private paginationService = inject(PaginationService);
  private modalConfirmationService = inject(ModalConfirmationService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  userQuery = this.userService.userQuery;
  currentPage = this.paginationService.currentPage;
  isOpenModalConfirmation = this.modalConfirmationService.isOpen;

  changeData = effect(() => {
    const page = this.currentPage();
    const limit = 10;
    const expectedOffset = (page - 1) * limit;

    this.userService.setPagination({
      limit,
      offset: expectedOffset,
    });

    const data = this.userQuery.data();
    const isLoading = this.userQuery.isLoading();

    if (!isLoading && data) {
      if (data.data.length === 0 && data.pages > 0) {
        // Redirigir a la última página válida
        const targetPage = Math.min(page, data.pages);
        if (targetPage !== page) {
          untracked(() => {
            this.router.navigate([], {
              queryParams: { page: targetPage },
              queryParamsHandling: 'merge',
            });
          });
        }
      }
    }
  });

  ngOnInit(): void {
    this.headerService.setOptions({
      title: 'Gestión de Usuarios',
      subTitle: 'Administra los usuarios del sistema',
      showSearch: false,
    });
  }

  onDelete(user: User) {
    this.modalConfirmationService.open({
      title: 'Elimina Usuario',
      message: `¿Estás seguro de que deseas eliminar al usuario con correo "${user.email.toLowerCase()}"? Esta acción no se puede deshacer.`,
      confirmAction: () => this.delete(user.id),
    });
  }

  private delete(id: string) {
    this.userService.delete(id).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: 'Usuario eliminado con éxito',
        });
        this.modalConfirmationService.close();
      },
      error: (err) => {
        this.alertService.open({
          type: 'error',
          message: err.message,
        });
      },
    });
  }
}

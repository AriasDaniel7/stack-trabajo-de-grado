import { DatePipe, LowerCasePipe, SlicePipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { FormUser } from '@profile/components/form-user/form-user';
import { FormUpdatePassword } from "@profile/components/form-update-password/form-update-password";

@Component({
  selector: 'profile-home-page',
  imports: [
    SlicePipe,
    UpperCasePipe,
    TitleCasePipe,
    LowerCasePipe,
    IconComponent,
    DatePipe,
    FormUser,
    FormUpdatePassword
],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePage {
  private authService = inject(AuthService);

  user = this.authService.user;
}

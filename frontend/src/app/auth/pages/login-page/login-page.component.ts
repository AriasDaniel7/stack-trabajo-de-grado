import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormLoginComponent } from '@auth/components/form-login/form-login.component';
import { AuthService } from '@auth/services/auth.service';
import { FooterComponent } from '@core/shared/components/footer/footer.component';
import { LoadingComponent } from "@core/shared/components/loading/loading.component";

@Component({
  selector: 'app-login-page',
  imports: [FormLoginComponent, FooterComponent, LoadingComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginPageComponent {
  private authService = inject(AuthService);
  status = this.authService.authStatus;
}

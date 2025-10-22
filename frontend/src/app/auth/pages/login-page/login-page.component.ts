import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormLoginComponent } from '@auth/components/form-login/form-login.component';

@Component({
  selector: 'app-login-page',
  imports: [FormLoginComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginPageComponent {}

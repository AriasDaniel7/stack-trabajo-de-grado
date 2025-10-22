import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtil } from '@core/utils/form';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';
import { AuthService } from '@auth/services/auth.service';
import { Login } from '@core/interfaces/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'auth-form-login',
  imports: [ReactiveFormsModule, IconComponent, LoadingComponent],
  templateUrl: './form-login.component.html',
  styleUrl: './form-login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormLoginComponent {
  private fb = new FormBuilder();
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  formUtil = FormUtil;

  myForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required]],
  });

  onSubmit() {
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;

    this.isLoading.set(true);
    this.alertService.close();

    const login: Login = {
      email: this.myForm.controls.email.value!,
      password: this.myForm.controls.password.value!,
    };

    this.authService.login(login).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.myForm.reset();
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.alertService.open({
          message: err.message,
          type: 'error',
        });
      },
    });
  }
}

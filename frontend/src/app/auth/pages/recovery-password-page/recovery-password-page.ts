import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { FooterComponent } from '@core/shared/components/footer/footer.component';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { FormUtil } from '@core/utils/form';
import { UserService } from '@user/services/user.service';
import { LoadingComponent } from '@core/shared/components/loading/loading.component';

@Component({
  selector: 'auth-recovery-password-page',
  imports: [FooterComponent, IconComponent, ReactiveFormsModule, RouterLink, LoadingComponent],
  templateUrl: './recovery-password-page.html',
  styleUrl: './recovery-password-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RecoveryPasswordPage {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private alertService = inject(AlertService);

  isLoading = signal(false);
  formUtil = FormUtil;

  myForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
  });

  onSubmit() {
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;
    this.alertService.close();
    this.isLoading.set(true);

    const sendEmail = {
      email: String(this.myForm.controls.email.value!).trim().toLowerCase(),
    };

    this.userService.updatePasswordByEmail(sendEmail).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: '¡Correo de recuperación enviado! Revisa tu bandeja de entrada.',
        });
        this.isLoading.set(false);
        this.myForm.reset();
      },
      error: (err) => {
        this.alertService.open({
          type: 'error',
          message: err.message,
        });
        this.isLoading.set(false);
      },
    });
  }
}

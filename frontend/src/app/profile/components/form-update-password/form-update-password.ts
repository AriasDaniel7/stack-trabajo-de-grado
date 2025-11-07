import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@auth/services/auth.service';
import { PasswordUpdate } from '@core/interfaces/auth';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { FormUtil } from '@core/utils/form';

@Component({
  selector: 'profile-form-update-password',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './form-update-password.html',
  styleUrl: './form-update-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormUpdatePassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);

  formUtil = FormUtil;

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  myForm = this.fb.group(
    {
      currentPassword: [null, [Validators.required]],
      newPassword: [null, [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: [null, [Validators.required]],
    },
    {
      validators: [this.formUtil.isFieldOneEqualToFieldTwo('newPassword', 'confirmNewPassword')],
    }
  );

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    switch (field) {
      case 'current':
        this.showCurrentPassword.update((v) => !v);
        break;
      case 'new':
        this.showNewPassword.update((v) => !v);
        break;
      case 'confirm':
        this.showConfirmPassword.update((v) => !v);
        break;
    }
  }

  onSubmit() {
    this.alertService.close();
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;

    if (this.authService.user()) {
      const updateData: PasswordUpdate = {
        currentPassword: String(this.myForm.value.currentPassword!),
        newPassword: String(this.myForm.value.newPassword!),
      };

      this.authService.updatePassword(this.authService.user()!.id, updateData).subscribe({
        next: () => {
          this.alertService.open({
            type: 'success',
            message: 'Contraseña actualizada con éxito',
          });
          this.myForm.reset();
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
}

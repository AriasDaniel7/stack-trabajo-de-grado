import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { FormUtil } from '@core/utils/form';
import { UserService } from '@user/services/user.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { PasswordUpdate } from '@core/interfaces/auth';
import { User } from '@core/interfaces/user';

@Component({
  selector: 'user-form-update-password',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './form-update-password.html',
  styleUrl: './form-update-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormUpdatePassword {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private alertService = inject(AlertService);
  user = input<User | null>(null);

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  formUtil = FormUtil;

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
    this.myForm.markAllAsTouched();
    this.alertService.close();

    if (this.myForm.invalid) return;

    const updateData: PasswordUpdate = {
      currentPassword: String(this.myForm.value.currentPassword!),
      newPassword: String(this.myForm.value.newPassword!),
    };

    if (this.user()) {
      this.userService.updatePassword(this.user()!.id, updateData).subscribe({
        next: () => {
          this.alertService.open({
            type: 'success',
            message: 'Contraseña actualizada correctamente.',
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

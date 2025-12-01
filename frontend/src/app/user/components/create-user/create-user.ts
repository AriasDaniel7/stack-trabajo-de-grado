import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Rol, User } from '@core/interfaces/user';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { FormUtil } from '@core/utils/form';
import { UserService } from '@user/services/user.service';

@Component({
  selector: 'user-create',
  imports: [IconComponent, ReactiveFormsModule],
  templateUrl: './create-user.html',
  styleUrl: './create-user.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUser {
  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);
  private userService = inject(UserService);

  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  formUtil = FormUtil;

  myForm = this.fb.group(
    {
      email: [null, [Validators.required, Validators.email]],
      name: [null, [Validators.required]],
      role: ['user', [Validators.required]],
      newPassword: [null, [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: [null, [Validators.required]],
    },
    {
      validators: [this.formUtil.isFieldOneEqualToFieldTwo('newPassword', 'confirmNewPassword')],
    }
  );

  togglePasswordVisibility(field: 'new' | 'confirm') {
    switch (field) {
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

    if (this.myForm.invalid) return;

    this.alertService.close();

    const data: Partial<User> & { password: string } = {
      name: String(this.myForm.value.name!),
      email: String(this.myForm.value.email!),
      role: this.myForm.value.role! as Rol,
      password: String(this.myForm.value.newPassword!),
    };

    this.userService.create(data).subscribe({
      next: () => {
        this.alertService.open({
          type: 'success',
          message: 'Usuario creado exitosamente.',
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

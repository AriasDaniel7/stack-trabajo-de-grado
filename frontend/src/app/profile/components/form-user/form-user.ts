import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtil } from '@core/utils/form';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { AuthService } from '@auth/services/auth.service';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { UserUpdate } from '@core/interfaces/user';

@Component({
  selector: 'profile-form-user',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './form-user.html',
  styleUrl: './form-user.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormUser {
  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);

  user = this.authService.user;
  formUtil = FormUtil;

  userEffect = effect(() => {
    if (this.user()) {
      untracked(() => {
        this.myForm.patchValue({
          name: this.user()!.name as any,
          email: this.user()!.email as any,
        });
      });
    }
  });

  myForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    name: [null, [Validators.required]],
  });

  onSubmit() {
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;

    this.alertService.close();

    const data: Partial<UserUpdate> = {
      name: this.myForm.value.name!,
      email: this.myForm.value.email!,
    };

    if (this.user()?.id) {
      this.authService.updateUser(this.user()!.id, data).subscribe({
        next: () => {
          this.alertService.open({
            type: 'success',
            message: 'Usuario actualizado con éxito',
          });
          this.authService.setUser({
            ...this.user()!,
            ...data,
          });
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

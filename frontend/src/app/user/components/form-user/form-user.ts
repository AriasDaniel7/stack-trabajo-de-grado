import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '@core/interfaces/user';
import { AlertService } from '@core/shared/components/alert/alert.service';
import { IconComponent } from '@core/shared/components/icon/icon.component';
import { FormUtil } from '@core/utils/form';
import { UserService } from '@user/services/user.service';

@Component({
  selector: 'user-form',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './form-user.html',
  styleUrl: './form-user.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormUser {
  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);
  private userService = inject(UserService);

  user = input<User | null>(null);

  formUtil = FormUtil;

  myForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    name: [null, [Validators.required]],
    role: ['user', [Validators.required]],
    isActive: [true, [Validators.required]],
  });

  changeData = effect(() => {
    const user = this.user();
    if (user) {
      this.myForm.patchValue({
        email: user.email as any,
        name: user.name as any,
        role: user.role as any,
        isActive: user.isActive as any,
      });
    }
  });

  onSubmit() {
    this.myForm.markAllAsTouched();

    if (this.myForm.invalid) return;

    this.alertService.close();

    const data: Partial<User> = {
      name: this.myForm.value.name!,
      email: this.myForm.value.email!,
      role: this.myForm.value.role! as any,
      isActive: this.myForm.value.isActive!,
    };

    if (this.user()?.id) {
      this.userService.updateUser(this.user()!.id, data).subscribe({
        next: () => {
          this.alertService.open({
            type: 'success',
            message: 'Usuario actualizado con éxito',
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

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UserResponse } from '@core/interfaces/user';

@Component({
  selector: 'user-info',
  imports: [],
  templateUrl: './info.html',
  styleUrl: './info.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Info {
  userResponse = input<UserResponse>();

  userActiveCount() {
    if (this.userResponse()?.data) {
      return this.userResponse()?.data.filter((user) => user.isActive).length;
    }

    return 0;
  }

  userInactiveCount() {
    if (this.userResponse()?.data) {
      return this.userResponse()?.data.filter((user) => !user.isActive).length;
    }

    return 0;
  }

  userIsAdminCount() {
    if (this.userResponse()?.data) {
      return this.userResponse()?.data.filter((user) => user.role === 'admin').length;
    }
    return 0;
  }
}

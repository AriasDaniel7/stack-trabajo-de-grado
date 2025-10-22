import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { LoadingComponent } from "@core/shared/components/loading/loading.component";
import { FooterComponent } from "@core/shared/components/footer/footer.component";

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, LoadingComponent, FooterComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {
  private authService = inject(AuthService);
  status = this.authService.authStatus;
}

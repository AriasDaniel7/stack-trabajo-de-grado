import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { HeaderService } from '@dashboard/components/header/header.service';

@Component({
  selector: 'dashboard-home-page',
  imports: [],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePageComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private headerService = inject(HeaderService);

  logout() {
    this.authService.logout().subscribe({
      next: (res) => {
        if (res) {
          this.router.navigateByUrl('/auth/login');
        }
      },
    });
  }

  ngOnInit() {
    this.headerService.setOptions({});
  }
}

import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { firstValueFrom } from 'rxjs';

export const notLoggedGuard: CanMatchFn = async (route, segments) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const authService = inject(AuthService);

  if (isPlatformBrowser(platformId)) {
    const isAuthenticated =
      authService.authStatusCheck ?? (await firstValueFrom(authService.checkAuth()));

    return !isAuthenticated ? true : router.createUrlTree(['/dashboard/home']);
  }

  return true;
};

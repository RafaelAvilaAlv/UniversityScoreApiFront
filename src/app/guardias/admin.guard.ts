import { CanActivateFn, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol'); // ← contiene "ADMIN"

  if (token && rol === 'ADMIN') {  // ← ✔️ coincide con lo guardado
    return true;
  }

  return router.parseUrl('/login');
};

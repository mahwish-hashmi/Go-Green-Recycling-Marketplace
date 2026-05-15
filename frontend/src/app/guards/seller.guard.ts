import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SellerGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('userRole');

    if (!token) {
      this.router.navigateByUrl('/login');
      return false;
    }
    if (role !== 'ROLE_SELLER') {
      this.router.navigateByUrl('/shop');
      return false;
    }
    return true;
  }
}

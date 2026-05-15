import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  // Step 1 = choose role, Step 2 = fill form
  step: number = 1;
  selectedRole: 'ROLE_BUYER' | 'ROLE_SELLER' = 'ROLE_BUYER';

  username    = '';
  password    = '';
  passwordConfirm = '';
  email       = '';
  address     = '';
  phone       = '';
  name        = '';
  storeName   = '';   // seller only

  error   = '';
  loading = false;
  success = false;

  constructor(private usersService: UsersService, private router: Router) {}

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.redirectByRole();
    }
  }

  selectRole(role: 'ROLE_BUYER' | 'ROLE_SELLER'): void {
    this.selectedRole = role;
    this.step = 2;
  }

  register(): void {
    this.error = '';
    if (!this.username || !this.password || !this.email || !this.name || !this.address || !this.phone) {
      this.error = 'All fields are required';
      return;
    }
    if (this.password !== this.passwordConfirm) {
      this.error = 'Passwords do not match';
      return;
    }
    if (this.password.length < 8) {
      this.error = 'Password must be at least 8 characters';
      return;
    }

    this.loading = true;

    this.usersService.register(
      this.username, this.password, this.email,
      this.name, this.address, this.phone, this.selectedRole
    ).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = true;
        if (response?.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userRole', response.role || this.selectedRole);
          localStorage.setItem('username', this.username);
          setTimeout(() => {
            this.redirectByRole();
            window.location.reload();
          }, 1200);
        } else {
          setTimeout(() => this.router.navigateByUrl('/login'), 1200);
        }
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 0) {
          this.error = 'Cannot connect to server. Is the backend running?';
        } else if (err.status === 400) {
          this.error = typeof err.error === 'string' ? err.error : 'Invalid details.';
        } else {
          this.error = 'Registration failed. Please try again.';
        }
      }
    });
  }

  redirectByRole(): void {
    const role = localStorage.getItem('userRole');
    if (role === 'ROLE_SELLER') {
      this.router.navigateByUrl('/seller');
    } else {
      this.router.navigateByUrl('/shop');
    }
  }
}

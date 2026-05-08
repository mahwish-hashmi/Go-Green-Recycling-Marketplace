import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  public username: string = '';
  public password: string = '';
  public passwordConfirm: string = '';
  public email: string = '';
  public address: string = '';
  public phone: string = '';
  public name: string = '';
  public error: string = '';
  public loading: boolean = false;
  public success: boolean = false;

  constructor(private usersService: UsersService, private router: Router) {}

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.router.navigateByUrl('/account');
    }
  }

  register() {
    this.error = '';

    if (!this.username || !this.password || !this.email ||
        !this.name || !this.address || !this.phone) {
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
      this.name, this.address, this.phone
    ).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = true;

        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userRole', response.role || 'ROLE_BUYER');
          localStorage.setItem('username', this.username);
          // Short delay so user sees success message
          setTimeout(() => {
            this.router.navigateByUrl('/account').then(() => window.location.reload());
          }, 1200);
        } else {
          setTimeout(() => this.router.navigateByUrl('/login'), 1200);
        }
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 0) {
          this.error = 'Cannot connect to server. Is the backend running on port 8080?';
        } else if (err.status === 400) {
          this.error = typeof err.error === 'string' ? err.error : 'Invalid registration details.';
        } else if (err.status === 401 || err.status === 403) {
          this.error = 'Security config error — /register must be public in WebSecurityConfig.';
        } else {
          this.error = 'Registration failed. Please try again.';
        }
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/User';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  loading = true;
  editing = false;
  saving = false;
  toast = '';

  editName = '';
  editEmail = '';
  editAddress = '';
  editPhone = '';

  get initials(): string {
    if (!this.user) return '?';
    const n = this.user.name || this.user.username || '';
    return n.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  }

  get isSeller(): boolean {
    return localStorage.getItem('userRole') === 'ROLE_SELLER';
  }

  constructor(private usersService: UsersService, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.loadUser();
  }

  loadUser(): void {
    this.usersService.getUserByToken().subscribe({
      next: (user: User) => {
        this.user = user;
        this.loading = false;
        this.editName    = user.name    || '';
        this.editEmail   = user.email   || '';
        this.editAddress = user.address || '';
        this.editPhone   = user.phone   || '';
      },
      error: (err) => {
        console.error('getUserByToken failed:', err);
        this.loading = false;
        // Show whatever we have from localStorage instead of redirecting
        this.user = {
          id: 0,
          username: localStorage.getItem('username') || 'User',
          name: localStorage.getItem('username') || '',
          email: '',
          address: '',
          phone: '',
          password: '',
          cartItems: []
        } as any;
      }
    });
  }

  saveChanges(): void {
    if (!this.user) return;
    this.saving = true;
    this.usersService.updateUser(
      String(this.user.id),
      this.user.username,
      this.user.password || '',
      this.editEmail,
      this.editName,
      this.editAddress,
      this.editPhone
    ).subscribe({
      next: (updated: User) => {
        this.user = updated;
        this.saving = false;
        this.editing = false;
        this.showToast('Profile updated! ✓');
      },
      error: () => {
        this.saving = false;
        this.showToast('Failed to save changes');
      }
    });
  }

  showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = '', 3000);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigateByUrl('/login').then(() => window.location.reload());
  }
}
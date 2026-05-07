import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Token } from '../models/Token';
import { User } from '../models/User';

@Injectable({ providedIn: 'root' })
export class UsersService {

  constructor(private http: HttpClient) {}

  // ── Auth endpoints (public — no token needed) ─────────────────────

  register(username: string, password: string, email: string,
           name: string, address: string, phone: string): Observable<any> {
    // POST http://localhost:8080/api/register
    return this.http.post<any>(`${environment.API_URL}/register`, {
      username, password, email, name, address, phone
    });
  }

  login(username: string, password: string): Observable<any> {
    // POST http://localhost:8080/api/login
    return this.http.post<any>(`${environment.API_URL}/login`, {
      username, password
    });
  }

  // ── Authenticated endpoints ───────────────────────────────────────

  createToken(username: string): Observable<Token> {
    return this.http.post<Token>(`${environment.API_URL}/create-token`, { username });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.API_URL}/users`);
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${environment.API_URL}/users/${id}`);
  }

  getUserByToken(): Observable<User> {
    // GET http://localhost:8080/api/user  (requires JWT)
    return this.http.get<User>(`${environment.API_URL}/user`);
  }

  updateUser(id: string, username: string, password: string, email: string,
             name: string, address: string, phone: string): Observable<User> {
    return this.http.put<User>(`${environment.API_URL}/users/${id}`, {
      username, password, email, name, address, phone
    });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${environment.API_URL}/users/${id}`);
  }
}

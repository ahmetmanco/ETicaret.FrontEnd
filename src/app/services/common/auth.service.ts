import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuthenticatedSubject.asObservable();

  constructor(private jwtHelper: JwtHelperService) {}

  setToken(token: string, role?: string): void {
    localStorage.setItem('accessToken', token);
    if (role) {
      localStorage.setItem('userRole', role);
    } else {
      const decoded = this.jwtHelper.decodeToken(token);
      const tokenRole = decoded?.role || decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if (tokenRole) {
        localStorage.setItem('userRole', Array.isArray(tokenRole) ? tokenRole[0] : tokenRole);
      }
    }
    this._isAuthenticatedSubject.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getUserRole(): string {
    const saved = localStorage.getItem('userRole');
    if (saved) return saved;
    const token = this.getToken();
    if (!token) return 'Customer';
    try {
      const decoded = this.jwtHelper.decodeToken(token);
      const r = decoded?.role || decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if (Array.isArray(r)) return r[0];
      return r || 'Customer';
    } catch {
      return 'Customer';
    }
  }

  getUserName(): string {
    const token = this.getToken();
    if (!token) return '';
    try {
      const decoded = this.jwtHelper.decodeToken(token);
      return decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded?.name || decoded?.sub || '';
    } catch {
      return '';
    }
  }

  isAdmin(): boolean {
    return this.getUserRole().toLowerCase() === 'admin';
  }

  isSeller(): boolean {
    return this.getUserRole().toLowerCase() === 'seller';
  }

  isCustomer(): boolean {
    return this.getUserRole().toLowerCase() === 'customer';
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    return token ? this.jwtHelper.isTokenExpired(token) : true;
  }

  removeToken(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    this._isAuthenticatedSubject.next(false);
  }

  logout() {
    this.removeToken();
  }

  identityCheck(): void {
    const token: string | null = localStorage.getItem('accessToken');
    const expired: boolean = token ? this.jwtHelper.isTokenExpired(token) : true;
    const result = token != null && !expired;
    this._isAuthenticatedSubject.next(result);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }
}

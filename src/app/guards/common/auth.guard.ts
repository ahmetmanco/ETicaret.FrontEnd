import { CanActivateFn, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { inject } from '@angular/core';
import { AuthService } from 'src/app/services/common/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const jwtHelper = inject(JwtHelperService);
  const authService = inject(AuthService); 

  const token = localStorage.getItem("accessToken");
  const isExpired = token ? jwtHelper.isTokenExpired(token) : true;

if (!authService.isAuthenticated()) {
    router.navigate(["login"], { queryParams: { returnUrl: state.url } });
    return false;
  }
  if (!token || isExpired) {
    authService.removeToken(); 
    router.navigate(["login"], { queryParams: { returnUrl: state.url } });
    return false;
  }
  return true;
};
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth-store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = inject(AuthStore).accessToken()
    const skipAuthHeader = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');
    const authReq = token && !skipAuthHeader ? req.clone({setHeaders:{Authorization: `Bearer ${token}` }}) : req
    return next(authReq);
};

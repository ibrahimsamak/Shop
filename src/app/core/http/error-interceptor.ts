import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth-store';
import { inject } from '@angular/core';
import { AuthApi } from '../auth/auth-api';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/ui/toast';

let isRefreshing = false;
const newAccessToken$ = new BehaviorSubject<string | null>(null);
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const api = inject(AuthApi);
  const router = inject(Router);
  const toast = inject(ToastService);

  const withToken = (r: HttpRequest<unknown>, token: string) =>
    r.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthCall = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');
      if (err.status === 401 && !isAuthCall) {
        if (isRefreshing) {
          return newAccessToken$.pipe(
            filter((t): t is string => t !== null),
            take(1),
            switchMap((t) => next(withToken(req, t))),
          );
        }
        const refresh = auth.refreshToken();
        if (!refresh) { auth.clear(); router.navigateByUrl('/login'); return throwError(() => err); }

        isRefreshing = true;
        newAccessToken$.next(null);
        return api.refresh(refresh).pipe(
          switchMap((res) => {
            auth.setAccessToken(res.accessToken);
            isRefreshing = false;
            newAccessToken$.next(res.accessToken);
            return next(withToken(req, res.accessToken));
          }),
          catchError((refreshErr) => {
            isRefreshing = false;
            auth.clear();
            router.navigateByUrl('/login');
            toast.error('Session expired. Please sign in again.');
            return throwError(() => refreshErr);
          }),
        );
      }
      if (err.status !== 401) toast.error(messageFor(err));
      return throwError(() => err);
    }),
  );
};

function messageFor(err: HttpErrorResponse): string {
  if (err.status === 0) return 'Network error — is the API running?';
  if (err.status === 403) return 'You do not have permission to do that.';
  if (err.status === 404) return 'Not found.';
  return err.error?.detail || err.error?.title || 'Something went wrong.';
}
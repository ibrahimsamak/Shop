import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthStore } from './auth-store';

export const authGuard: CanMatchFn = () => {
    const auth = inject(AuthStore);
    const check = auth.isLoggedIn()? true: inject(Router).parseUrl('/login')
    return check;
}

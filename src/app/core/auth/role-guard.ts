import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../../models/user';
import { AuthStore } from './auth-store';
import { inject } from '@angular/core';

export const roleGuard = (..._roles: Role[]): CanActivateFn => () => {
    const auth = inject(AuthStore)
    return auth.hasRole(..._roles) ? true : inject(Router).parseUrl('/login')
} 

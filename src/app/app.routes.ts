import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './core/auth/auth-guard';
import { roleGuard } from './core/auth/role-guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login').then((m) => m.Login) },
  {
    path: '',
    component: Dashboard,
    canMatch: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage) },
      { path: 'orders', loadComponent: () => import('./features/orders/order-list').then((m) => m.OrderList) },
      { path: 'orders/:id', loadComponent: () => import('./features/orders/order-detail').then((m) => m.OrderDetail) },
      { path: 'products', loadComponent: () => import('./features/products/product-list').then((m) => m.ProductList) },
      { path: 'products/new', canActivate: [roleGuard('admin','manager')], loadComponent: () => import('./features/products/product-form').then((m) => m.ProductForm) },
      { path: 'products/:id/edit', canActivate: [roleGuard('admin','manager')], loadComponent: () => import('./features/products/product-form').then((m) => m.ProductForm) },
      { path: 'users', canActivate: [roleGuard('admin','manager')], loadComponent: () => import('./features/users/user-list').then((m) => m.UserList) },
      { path: 'users/new', canActivate: [roleGuard('admin')], loadComponent: () => import('./features/users/user-form').then((m) => m.UserForm) },
      { path: 'users/:id/edit', canActivate: [roleGuard('admin','manager')], loadComponent: () => import('./features/users/user-form').then((m) => m.UserForm) },
    ],
  },
  { path: '**', redirectTo: '' },
];

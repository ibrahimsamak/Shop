import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthApi } from '../../core/auth/auth-api';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/ui/toast';
import { AuthStore } from '../../core/auth/auth-store';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-wrap">
      <mat-card class="login-card" appearance="outlined">
        <mat-card-header>
          <div mat-card-avatar class="logo"><mat-icon>storefront</mat-icon></div>
          <mat-card-title>Admin Portal</mat-card-title>
          <mat-card-subtitle>Sign in to continue</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <mat-icon matPrefix>mail</mat-icon>
              <input matInput type="email" formControlName="email" autocomplete="username" />
              @if (form.controls.email.hasError('required')) {
                <mat-error>Email is required</mat-error>
              } @else if (form.controls.email.hasError('email')) {
                <mat-error>Enter a valid email address</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                formControlName="password"
                autocomplete="current-password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword.set(!hidePassword())"
                [attr.aria-label]="hidePassword() ? 'Show password' : 'Hide password'"
              >
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.controls.password.hasError('required')) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="submit"
              [disabled]="form.invalid || loading()"
            >
              @if (loading()) {
                <mat-spinner diameter="20" />
              } @else {
                Sign in
              }
            </button>

            <p class="hint">admin&#64;shop.io / admin123</p>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100dvh;
      padding: 1rem;
      background: var(--mat-sys-surface-container);
    }
    .login-card {
      width: min(400px, 100%);
    }
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--mat-sys-primary) 15%, transparent);
      color: var(--mat-sys-primary);
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .login-form mat-form-field {
      width: 100%;
    }
    .submit {
      height: 44px;
    }
    .submit mat-spinner {
      margin: 0 auto;
    }
    .hint {
      text-align: center;
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-label-medium);
      margin: 0.5rem 0 0;
    }
  `],
})
export class Login {
  private fb = inject(FormBuilder);
  private api = inject(AuthApi)
  private auth = inject(AuthStore)
  private router = inject(Router)
  private toast = inject(ToastService)

  loading = signal(false);
  hidePassword = signal(true);

  form = this.fb.nonNullable.group({
    email: ['admin@shop.io', [Validators.required, Validators.email]],
    password: ['admin123', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.api.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.auth.setSession(res.accessToken, res.refreshToken, res.roles, res.user);
        this.toast.success(`Welcome, ${res.user.name}`)
        this.router.navigateByUrl('/dashboard')
      },
      error: () => {
          this.loading.set(false)
          this.toast.error('Invalid email or password')
      }
    })
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { UsersApi } from './users-api';
import { ToastService } from '../../shared/ui/toast';
import { Role } from '../../models/user';

@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatCheckboxModule, MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="form-card" appearance="outlined">
      <mat-card-header>
        <mat-card-title>{{ id() ? 'Edit user' : 'New user' }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="save()" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) { <mat-error>Name is required</mat-error> }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" />
            @if (form.controls.email.hasError('required')) { <mat-error>Email is required</mat-error> }
            @else if (form.controls.email.hasError('email')) { <mat-error>Enter a valid email</mat-error> }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Roles</mat-label>
            <mat-select formControlName="roles" multiple>
              @for (r of allRoles; track r) { <mat-option [value]="r">{{ r }}</mat-option> }
            </mat-select>
            @if (form.controls.roles.hasError('required')) { <mat-error>Pick at least one role</mat-error> }
          </mat-form-field>

          <mat-checkbox formControlName="active">Active</mat-checkbox>

          <div class="actions">
            <a mat-button routerLink="/users">Cancel</a>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              {{ id() ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-card { max-width: 520px; }
    .form { display: flex; flex-direction: column; gap: .5rem; margin-top: .5rem; }
    .form mat-form-field { width: 100%; }
    .actions { display: flex; justify-content: flex-end; gap: .5rem; margin-top: .5rem; }
  `],
})
export class UserForm {
  private fb = inject(FormBuilder);
  private api = inject(UsersApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  id = signal<number | null>(null);
  saving = signal(false);
  readonly allRoles: Role[] = ['admin', 'manager', 'viewer'];

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    active: [true],
    roles: [['viewer'] as Role[], Validators.required],
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id.set(Number(idParam));
      this.api.get(this.id()!).subscribe((u) => this.form.patchValue(u));
    }
  }

  async save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const body = this.form.getRawValue();
    try {
      if (this.id()) await firstValueFrom(this.api.update(this.id()!, body));
      else await firstValueFrom(this.api.create(body));
      this.toast.success('User saved');
      this.router.navigateByUrl('/users');
    } catch {
      this.saving.set(false);
    }
  }
}

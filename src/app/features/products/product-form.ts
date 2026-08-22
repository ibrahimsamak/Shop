import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductsApi } from './products-api';
import { ToastService } from '../../shared/ui/toast';

@Component({
  selector: 'app-product-form',
  imports: [
    ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
template: `
    <mat-card class="form-card" appearance="outlined">
      <mat-card-header>
        <mat-card-title>{{ id() ? 'Edit product' : 'New product' }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="save()" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.hasError('required')) { <mat-error>Name is required</mat-error> }
          </mat-form-field>

          <div class="row2">
            <mat-form-field appearance="outline">
              <mat-label>Price</mat-label>
              <span matTextPrefix>$&nbsp;</span>
              <input matInput type="number" formControlName="price" min="0" step="0.01" />
              @if (form.controls.price.hasError('required')) { <mat-error>Required</mat-error> }
              @else if (form.controls.price.hasError('min')) { <mat-error>Must be ≥ 0</mat-error> }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Stock</mat-label>
              <input matInput type="number" formControlName="stock" min="0" />
              @if (form.controls.stock.hasError('required')) { <mat-error>Required</mat-error> }
              @else if (form.controls.stock.hasError('min')) { <mat-error>Must be ≥ 0</mat-error> }
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              @for (c of categirues; track c) { <mat-option [value]="c">{{ c }}</mat-option> }
            </mat-select>
            @if (form.controls.category.hasError('required')) { <mat-error>Pick a category</mat-error> }
          </mat-form-field>

          <div class="actions">
            <a mat-button routerLink="/products">Cancel</a>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              {{ id() ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>

        <div class="image-section">
          <h3>Image</h3>
          @if (imageUrl()) {
            <img class="preview" [src]="imageUrl()" alt="Product image" />
          } @else {
            <div class="preview placeholder"><mat-icon>image</mat-icon></div>
          }
          <button mat-stroked-button type="button" [disabled]="!id()" (click)="fileInput.click()">
            <mat-icon>upload</mat-icon> Upload image
          </button>
          <input #fileInput type="file" accept="image/*" hidden (change)="onFile($event)" />
          @if (!id()) { <small>Save the product first to enable image upload.</small> }
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-card { max-width: 560px; }
    .form { display: flex; flex-direction: column; gap: .5rem; margin-top: .5rem; }
    .form mat-form-field { width: 100%; }
    .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
    .actions { display: flex; justify-content: flex-end; gap: .5rem; margin-top: .5rem; }
    .image-section { margin-top: 1rem; display: flex; flex-direction: column; align-items: flex-start; gap: .5rem;
                     border-top: 1px solid var(--mat-sys-outline-variant); padding-top: 1rem; }
    .preview { width: 120px; height: 120px; object-fit: cover; border-radius: .5rem;
               border: 1px solid var(--mat-sys-outline-variant); }
    .preview.placeholder { display: flex; align-items: center; justify-content: center; color: var(--mat-sys-outline); }
    small { color: var(--mat-sys-on-surface-variant); }
  `],
})
export class ProductForm {
  private fb = inject(FormBuilder);
  private api = inject(ProductsApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router)
  private toast = inject(ToastService)
  id = signal<number | null>(null);
  saving = signal(false);
  imageUrl = signal<string | null>(null);
  readonly categirues = ['Laptops', 'Phones', 'Audio', 'Accessories', 'Wearables', 'Cameras'];

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: ['', Validators.required],
  })

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id')
    if (idParam) {
      this.id.set(Number(idParam));
      this.api.get(this.id()!).subscribe((p) => {
        this.form.patchValue(p);
        this.imageUrl.set(p.imageUrl ?? null);
      })
      }
  }

  async save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const body = this.form.getRawValue();
    try {
      if (this.id()) {
        await firstValueFrom(this.api.update(this.id()!, body));
        this.toast.success('Product updated');
        this.router.navigateByUrl('/products');
      } else {
        const created = await firstValueFrom(this.api.create(body));
        this.id.set(created.id);                
        this.toast.success('Product created — add an image or go back');
        this.saving.set(false);
      }
    } catch {
      this.saving.set(false);
    }
  }

  onFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file || !this.id()) return;
    this.api.uploadImage(this.id()!, file).subscribe((r) => {
      this.imageUrl.set(r.url);
      this.toast.success('Image uploaded!');
    })
  }
}

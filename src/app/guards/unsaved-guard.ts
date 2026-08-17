import { CanDeactivateFn } from '@angular/router';
export interface HasUnsaved { hasUnsavedChanges(): boolean; }
export const unsavedGuard: CanDeactivateFn<HasUnsaved> = (c) =>
  c.hasUnsavedChanges() ? confirm('Discard unsaved changes?') : true;

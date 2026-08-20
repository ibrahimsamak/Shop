import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from '../../shared/ui/toast';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private toast = inject(ToastService);
  handleError(error: unknown) {
    console.error(error);
    this.toast.error('Unexpected error. Please try again.');
  }
}

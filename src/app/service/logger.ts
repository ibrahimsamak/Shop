import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config';

@Injectable({
  providedIn: 'root',
})
export class Logger {
  private config = inject(APP_CONFIG)
  log(msg: string) {
    console.log(`[${this.config.apiBaseUrl}] ${msg}`)
  }
}

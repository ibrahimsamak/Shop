import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DashboardSummary } from '../../models/dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardApi {

  private http = inject(HttpClient);
  summary() { return this.http.get<DashboardSummary>('/api/dashboard/summary'); }
}

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface DashboardSummary {
  revenue: number;
  orderCount: number;
  userCount: number;
  lowStock: number;
  revenueSeries: SeriesPoint[];
}

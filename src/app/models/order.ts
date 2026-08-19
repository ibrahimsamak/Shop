export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

export interface TimelineEntry {
  status: string;
  at: string;
}

export interface Order {
  id: number;
  customer: string;
  items: OrderItem[];
  total: number;
  status: string;
  timeline: TimelineEntry[];
}

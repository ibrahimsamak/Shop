export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string | null;
}

export interface ProductCreate {
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string | null;
}

export interface ProductUpdate {
  name?: string;
  price?: number;
  stock?: number;
  category?: string;
  imageUrl?: string | null;
}

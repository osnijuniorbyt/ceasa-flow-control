
export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  supplier: string;
  location: string;
  expiryDate: string;
}

export interface StockStatus {
  label: string;
  color: string;
}

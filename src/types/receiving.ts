
export interface Container {
  code: string;
  name: string;
  weight: number; // in kg
}

export interface ProductReceiving {
  id: string;
  name: string;
  expectedQuantity: number;
  expectedWeight?: number;
  unit: string;
  supplier: string;
  category: string;
}

export interface WeighingRecord {
  id: string;
  productId: string;
  containerType: string;
  grossWeight: number;
  netWeight: number;
  quantity: number;
  timestamp: Date;
  conferente: string;
  hasDivergence: boolean;
  divergenceReason?: string;
}

export interface Divergence {
  type: 'weight' | 'quantity' | 'quality';
  expected: number;
  actual: number;
  percentage: number;
  severity: 'low' | 'medium' | 'high';
}

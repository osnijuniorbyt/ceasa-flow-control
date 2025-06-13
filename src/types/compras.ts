
export interface PurchaseProduct {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  stockLevel: "critical" | "low" | "medium" | "good";
  suggestedQuantity: number;
  lastSupplier: string;
  lastPrice: number;
  supplierRating: "excellent" | "good" | "warning" | "poor";
  supplierNote: string;
  dailySales: number;
  isSelected: boolean;
  thumbnail?: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  location: string;
  rating: number;
  reliability: number;
  lastOrderDate: string;
  specialties: string[];
  contact: string;
  notes: string;
  totalOrders: number;
  onTimeDelivery: number;
  paymentMethod: "NOTA FISCAL" | "BOLETO";
  paymentStatus: "PAGO" | "PENDENTE" | "VENCIDO";
  outstandingAmount: number;
  lastPaymentDate: string;
  nextDueDate: string;
}

export interface PurchaseOrder {
  id: string;
  date: string;
  supplier: string;
  supplierCode: string;
  products: PurchaseProduct[];
  totalValue: number;
  status: "draft" | "sent" | "confirmed" | "delivered";
  deliveryDate?: string;
  notes?: string;
  paymentStatus: "PAGO" | "PENDENTE" | "VENCIDO";
  paymentMethod: "NOTA FISCAL" | "BOLETO";
  dueDate: string;
  isPaid: boolean;
  paymentDate?: string;
}

export interface PurchaseInsight {
  type: "top_seller" | "best_supplier" | "price_alert" | "promotion" | "stock_alert" | "payment_alert";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionable?: boolean;
}

export interface PaymentReport {
  period: string;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  suppliersCount: number;
  averagePaymentDelay: number;
  paymentsByMethod: {
    notaFiscal: number;
    boleto: number;
  };
}

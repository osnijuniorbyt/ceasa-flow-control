import { PurchaseOrder, Supplier } from "@/types/compras";
import { FastCheckoutProduct } from "@/types/fastCheckout";

const STORAGE_KEYS = {
  PURCHASE_ORDERS: 'purchase_orders',
  SUPPLIERS: 'suppliers',
  PRODUCTS: 'products'
};

export class PurchaseService {
  // Purchase Orders
  static getPurchaseOrders(): PurchaseOrder[] {
    const stored = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
    if (!stored) {
      // Initialize with some sample data
      const sampleOrders: PurchaseOrder[] = [
        {
          id: "PO-001",
          date: "2024-01-15",
          supplier: "João Silva",
          supplierCode: "D22 rua",
          products: [],
          totalValue: 1500.00,
          status: "delivered",
          paymentStatus: "PENDENTE",
          paymentMethod: "NOTA FISCAL",
          dueDate: "2024-01-22",
          isPaid: false
        },
        {
          id: "PO-002",
          date: "2024-01-14",
          supplier: "Maria Santos",
          supplierCode: "E10",
          products: [],
          totalValue: 850.00,
          status: "delivered",
          paymentStatus: "VENCIDO",
          paymentMethod: "BOLETO",
          dueDate: "2024-01-18",
          isPaid: false
        }
      ];
      this.savePurchaseOrders(sampleOrders);
      return sampleOrders;
    }
    return JSON.parse(stored);
  }

  static savePurchaseOrders(orders: PurchaseOrder[]): void {
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(orders));
  }

  static createPurchaseOrder(orderData: Omit<PurchaseOrder, 'id'>): PurchaseOrder {
    const orders = this.getPurchaseOrders();
    const newOrder: PurchaseOrder = {
      ...orderData,
      id: `PO-${String(orders.length + 1).padStart(3, '0')}`
    };
    
    orders.unshift(newOrder); // Add to beginning of array
    this.savePurchaseOrders(orders);
    
    return newOrder;
  }

  static updatePurchaseOrderPayment(orderId: string, isPaid: boolean): void {
    const orders = this.getPurchaseOrders();
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          isPaid,
          paymentStatus: isPaid ? "PAGO" : "PENDENTE" as "PAGO" | "PENDENTE" | "VENCIDO",
          paymentDate: isPaid ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return order;
    });
    this.savePurchaseOrders(updatedOrders);
  }

  // Products
  static getProducts(): FastCheckoutProduct[] {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!stored) {
      // Initialize with mock data
      const mockProducts: FastCheckoutProduct[] = [
        {
          id: "P001",
          name: "Alface hidropônica",
          category: "Verduras",
          currentStock: 2,
          originalStock: 2,
          unit: "cx",
          stockLevel: "critical",
          suggestedQuantity: 10,
          targetQuantity: 10,
          lastSupplier: "D22 rua",
          lastPrice: 18.00,
          unitPrice: 18.00,
          supplierRating: "good",
          supplierNote: "Sempre pontual",
          dailySales: 8,
          isSelected: false,
          paymentMethod: "NOTA FISCAL",
          daysToPayment: 14
        },
        {
          id: "P002",
          name: "Moranguinho",
          category: "Frutas",
          currentStock: 1,
          originalStock: 1,
          unit: "cx",
          stockLevel: "critical",
          suggestedQuantity: 6,
          targetQuantity: 6,
          lastSupplier: "E10",
          lastPrice: 45.00,
          unitPrice: 45.00,
          supplierRating: "excellent",
          supplierNote: "Melhor qualidade",
          dailySales: 4,
          isSelected: false,
          paymentMethod: "BOLETO",
          daysToPayment: 7
        },
        {
          id: "P003",
          name: "Tomate grape",
          category: "Legumes",
          currentStock: 3,
          originalStock: 3,
          unit: "cx",
          stockLevel: "low",
          suggestedQuantity: 8,
          targetQuantity: 8,
          lastSupplier: "F59",
          lastPrice: 25.00,
          unitPrice: 25.00,
          supplierRating: "warning",
          supplierNote: "Qualidade variável",
          dailySales: 6,
          isSelected: false,
          paymentMethod: "BOLETO",
          daysToPayment: 10
        },
        {
          id: "P004",
          name: "Berinjela",
          category: "Legumes",
          currentStock: 1,
          originalStock: 1,
          unit: "cx",
          stockLevel: "critical",
          suggestedQuantity: 5,
          targetQuantity: 5,
          lastSupplier: "F100",
          lastPrice: 22.00,
          unitPrice: 22.00,
          supplierRating: "good",
          supplierNote: "Boa qualidade",
          dailySales: 3,
          isSelected: false,
          paymentMethod: "BOLETO",
          daysToPayment: 7
        }
      ];
      this.saveProducts(mockProducts);
      return mockProducts;
    }
    return JSON.parse(stored);
  }

  static saveProducts(products: FastCheckoutProduct[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  static addNewProduct(product: FastCheckoutProduct): void {
    const products = this.getProducts();
    products.push(product);
    this.saveProducts(products);
  }

  static updateProductStock(productId: string, newStock: number): void {
    const products = this.getProducts();
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        const stockLevel = newStock <= 2 ? "critical" : 
                          newStock <= 5 ? "low" : 
                          newStock <= 10 ? "medium" : "good";
        
        return {
          ...product,
          currentStock: newStock,
          stockLevel: stockLevel as "critical" | "low" | "medium" | "good"
        };
      }
      return product;
    });
    this.saveProducts(updatedProducts);
  }

  // Suppliers
  static getSuppliers(): Supplier[] {
    const stored = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    if (!stored) {
      const sampleSuppliers: Supplier[] = [
        {
          id: "S001",
          name: "João Silva",
          code: "D22 rua",
          location: "Centro",
          rating: 4.5,
          reliability: 95,
          lastOrderDate: "2024-01-15",
          specialties: ["Verduras", "Frutas"],
          contact: "(11) 99999-1234",
          notes: "Sempre pontual",
          totalOrders: 45,
          onTimeDelivery: 95,
          paymentMethod: "NOTA FISCAL",
          paymentStatus: "PENDENTE",
          outstandingAmount: 1500.00,
          lastPaymentDate: "2024-01-10",
          nextDueDate: "2024-01-22"
        },
        {
          id: "S002",
          name: "Maria Santos",
          code: "E10",
          location: "Zona Norte",
          rating: 4.8,
          reliability: 98,
          lastOrderDate: "2024-01-14",
          specialties: ["Frutas premium"],
          contact: "(11) 88888-5678",
          notes: "Melhor qualidade",
          totalOrders: 32,
          onTimeDelivery: 98,
          paymentMethod: "BOLETO",
          paymentStatus: "VENCIDO",
          outstandingAmount: 850.00,
          lastPaymentDate: "2024-01-05",
          nextDueDate: "2024-01-18"
        }
      ];
      this.saveSuppliers(sampleSuppliers);
      return sampleSuppliers;
    }
    return JSON.parse(stored);
  }

  static saveSuppliers(suppliers: Supplier[]): void {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }

  // Business Logic
  static processOrdersBySupplier(selectedProducts: FastCheckoutProduct[]): PurchaseOrder[] {
    const ordersBySupplier = selectedProducts.reduce((acc, product) => {
      const supplier = product.lastSupplier;
      if (!acc[supplier]) {
        acc[supplier] = {
          products: [],
          total: 0,
          paymentMethod: product.paymentMethod,
          dueDate: new Date(Date.now() + product.daysToPayment * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          supplierCode: supplier
        };
      }
      acc[supplier].products.push(product);
      acc[supplier].total += product.targetQuantity * product.unitPrice;
      return acc;
    }, {} as any);

    const createdOrders: PurchaseOrder[] = [];
    const suppliers = this.getSuppliers();

    Object.entries(ordersBySupplier).forEach(([supplierCode, orderData]: [string, any]) => {
      const supplier = suppliers.find(s => s.code === supplierCode);
      const supplierName = supplier?.name || supplierCode;

      const order = this.createPurchaseOrder({
        date: new Date().toISOString().split('T')[0],
        supplier: supplierName,
        supplierCode: supplierCode,
        products: orderData.products,
        totalValue: orderData.total,
        status: "draft",
        paymentStatus: "PENDENTE",
        paymentMethod: orderData.paymentMethod,
        dueDate: orderData.dueDate,
        isPaid: false
      });

      createdOrders.push(order);

      // Update stock levels for ordered products
      orderData.products.forEach((product: FastCheckoutProduct) => {
        const newStock = product.currentStock + product.targetQuantity;
        this.updateProductStock(product.id, newStock);
      });
    });

    return createdOrders;
  }

  // Analytics
  static getOrderStats() {
    const orders = this.getPurchaseOrders();
    const products = this.getProducts();
    
    return {
      totalOrders: orders.length,
      pendingPayments: orders.filter(o => !o.isPaid).length,
      totalValue: orders.reduce((sum, order) => sum + order.totalValue, 0),
      criticalProducts: products.filter(p => p.stockLevel === "critical").length,
      lowStockProducts: products.filter(p => p.stockLevel === "low").length
    };
  }
}

export interface Product {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  pricePerUnit: number;
  supplier: string;
  location: string;
  lastRestocked: string;
  status: "normal" | "low" | "critical" | "overstock";
}

export type ProductCategory = "all" | "Verduras" | "Frutas" | "Legumes" | "Tubérculos" | "Temperos";

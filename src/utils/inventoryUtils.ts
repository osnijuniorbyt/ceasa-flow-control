
import { StockStatus } from "@/types/inventory";

export const getStockStatus = (quantity: number, minStock: number): StockStatus => {
  if (quantity <= minStock) {
    return { label: "Estoque Baixo", color: "bg-red-100 text-red-800" };
  } else if (quantity <= minStock * 1.5) {
    return { label: "Atenção", color: "bg-yellow-100 text-yellow-800" };
  }
  return { label: "Normal", color: "bg-green-100 text-green-800" };
};

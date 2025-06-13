
import React from "react";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "critical":
      return <Badge className="bg-red-100 text-red-800">Crítico</Badge>;
    case "low":
      return <Badge className="bg-yellow-100 text-yellow-800">Baixo</Badge>;
    case "overstock":
      return <Badge className="bg-blue-100 text-blue-800">Excesso</Badge>;
    default:
      return <Badge className="bg-green-100 text-green-800">Normal</Badge>;
  }
};

export const getStockIcon = (current: number, min: number, max: number) => {
  if (current <= min * 0.5) return <TrendingDown className="h-4 w-4 text-red-500" />;
  if (current >= max * 0.9) return <TrendingUp className="h-4 w-4 text-blue-500" />;
  return null;
};

export const calculateTotalValue = (products: Product[]): number => {
  return products.reduce((sum, product) => sum + (product.currentStock * product.pricePerUnit), 0);
};

export const getCriticalProductsCount = (products: Product[]): number => {
  return products.filter(p => p.status === "critical").length;
};

export const getLowStockProductsCount = (products: Product[]): number => {
  return products.filter(p => p.status === "low").length;
};

export const filterProducts = (
  products: Product[], 
  searchTerm: string, 
  selectedCategory: string
): Product[] => {
  return products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
};

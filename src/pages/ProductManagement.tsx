
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Product, ProductCategory } from "@/types/product";
import { filterProducts } from "@/utils/productUtils";
import ProductStatsCards from "@/components/product-management/ProductStatsCards";
import ProductFilters from "@/components/product-management/ProductFilters";
import ProductTable from "@/components/product-management/ProductTable";

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const products: Product[] = [
    {
      id: "P001",
      name: "Alface hidropônica",
      category: "Verduras",
      currentStock: 45,
      unit: "unidades",
      minStock: 20,
      maxStock: 80,
      pricePerUnit: 3.50,
      supplier: "D22 Hidropônicos",
      location: "A1-001",
      lastRestocked: "2024-01-15",
      status: "normal"
    },
    {
      id: "P002",
      name: "Moranguinho",
      category: "Frutas",
      currentStock: 12,
      unit: "bandejas",
      minStock: 15,
      maxStock: 50,
      pricePerUnit: 8.00,
      supplier: "F59 Frutas Premium",
      location: "B1-001",
      lastRestocked: "2024-01-14",
      status: "low"
    },
    {
      id: "P003",
      name: "Tomate grape",
      category: "Legumes",
      currentStock: 3,
      unit: "kg",
      minStock: 10,
      maxStock: 40,
      pricePerUnit: 12.00,
      supplier: "E10 Orgânicos",
      location: "A1-002",
      lastRestocked: "2024-01-12",
      status: "critical"
    },
    {
      id: "P004",
      name: "Alho descascado 500g",
      category: "Temperos",
      currentStock: 25,
      unit: "pacotes",
      minStock: 10,
      maxStock: 30,
      pricePerUnit: 15.50,
      supplier: "E104 Temperos",
      location: "A2-003",
      lastRestocked: "2024-01-13",
      status: "normal"
    },
    {
      id: "P005",
      name: "Baroa granel",
      category: "Tubérculos",
      currentStock: 85,
      unit: "kg",
      minStock: 20,
      maxStock: 60,
      pricePerUnit: 6.80,
      supplier: "F100 Tubérculos",
      location: "C1-001",
      lastRestocked: "2024-01-16",
      status: "overstock"
    },
    {
      id: "P006",
      name: "Batata doce branca",
      category: "Tubérculos",
      currentStock: 8,
      unit: "kg",
      minStock: 15,
      maxStock: 50,
      pricePerUnit: 4.20,
      supplier: "H55 Raízes",
      location: "C1-002",
      lastRestocked: "2024-01-11",
      status: "low"
    },
    {
      id: "P007",
      name: "Rúcula orgânica",
      category: "Verduras",
      currentStock: 32,
      unit: "maços",
      minStock: 25,
      maxStock: 60,
      pricePerUnit: 4.50,
      supplier: "D22 Hidropônicos",
      location: "A1-003",
      lastRestocked: "2024-01-15",
      status: "normal"
    },
    {
      id: "P008",
      name: "Cenoura baby",
      category: "Legumes",
      currentStock: 18,
      unit: "kg",
      minStock: 12,
      maxStock: 35,
      pricePerUnit: 7.90,
      supplier: "V33 Vegetais",
      location: "A1-004",
      lastRestocked: "2024-01-14",
      status: "normal"
    }
  ];

  const categories: ProductCategory[] = ["all", "Verduras", "Frutas", "Legumes", "Tubérculos", "Temperos"];

  const filteredProducts = filterProducts(products, searchTerm, selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Produtos</h2>
          <p className="text-muted-foreground">
            Controle completo de produtos CEASA
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      <ProductStatsCards products={products} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Produtos</CardTitle>
            <ProductFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ProductTable products={filteredProducts} />
        </CardContent>
      </Card>
    </div>
  );
}

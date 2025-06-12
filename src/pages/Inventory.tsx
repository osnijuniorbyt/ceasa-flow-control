
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Product } from "@/types/inventory";
import { InventoryStats } from "@/components/inventory/InventoryStats";
import { InventoryProductList } from "@/components/inventory/InventoryProductList";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");

  const products: Product[] = [
    {
      id: "P001",
      name: "Alface hidroponica",
      category: "Verduras",
      quantity: 15,
      unit: "unidades",
      minStock: 10,
      supplier: "D22 rua",
      location: "A1-001",
      expiryDate: "2024-01-20",
    },
    {
      id: "P002",
      name: "Tomate grape",
      category: "Legumes",
      quantity: 3,
      unit: "kg",
      minStock: 8,
      supplier: "E10",
      location: "A1-002",
      expiryDate: "2024-01-18",
    },
    {
      id: "P003",
      name: "Moranguinho",
      category: "Frutas",
      quantity: 12,
      unit: "unidades",
      minStock: 5,
      supplier: "F59",
      location: "B1-001",
      expiryDate: "2024-01-17",
    },
    {
      id: "P004",
      name: "Alho desc 500g",
      category: "Temperos",
      quantity: 8,
      unit: "pacotes",
      minStock: 5,
      supplier: "E104",
      location: "A2-003",
      expiryDate: "2024-02-15",
    },
    {
      id: "P005",
      name: "Baroa granel",
      category: "Tubérculos",
      quantity: 25,
      unit: "kg",
      minStock: 15,
      supplier: "F100",
      location: "C1-001",
      expiryDate: "2024-01-25",
    },
    {
      id: "P006",
      name: "Batata doce branca",
      category: "Tubérculos",
      quantity: 2,
      unit: "kg",
      minStock: 10,
      supplier: "H55",
      location: "C1-002",
      expiryDate: "2024-01-22",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventário</h2>
          <p className="text-muted-foreground">
            Controle de estoque e produtos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      <InventoryStats />

      <InventoryProductList 
        products={products}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </div>
  );
}

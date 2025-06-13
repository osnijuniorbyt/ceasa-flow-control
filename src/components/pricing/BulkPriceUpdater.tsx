
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { UpdateMethodSelector } from "./UpdateMethodSelector";
import { ItemPreview } from "./ItemPreview";
import { ValidationSummary } from "./ValidationSummary";
import { BulkControls } from "./BulkControls";

interface BulkUpdateItem {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  newPrice: number;
  change: number;
  selected: boolean;
  validation: "valid" | "warning" | "error";
  message?: string;
}

export function BulkPriceUpdater() {
  const [updateMethod, setUpdateMethod] = useState<"percentage" | "fixed" | "csv">("percentage");
  const [percentageValue, setPercentageValue] = useState(5);
  const [fixedValue, setFixedValue] = useState(1.00);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [csvData, setCsvData] = useState("");

  const [bulkItems, setBulkItems] = useState<BulkUpdateItem[]>([
    {
      id: "P001",
      name: "Alface hidropônica",
      category: "Verduras",
      currentPrice: 4.80,
      newPrice: 5.04,
      change: 5,
      selected: true,
      validation: "valid"
    },
    {
      id: "P002",
      name: "Tomate grape",
      category: "Legumes",
      currentPrice: 7.50,
      newPrice: 7.88,
      change: 5,
      selected: true,
      validation: "valid"
    },
    {
      id: "P003",
      name: "Moranguinho",
      category: "Frutas",
      currentPrice: 14.00,
      newPrice: 14.70,
      change: 5,
      selected: false,
      validation: "warning",
      message: "Preço pode estar alto para o mercado"
    },
    {
      id: "P004",
      name: "Batata doce branca",
      category: "Tubérculos",
      currentPrice: 4.20,
      newPrice: 4.41,
      change: 5,
      selected: true,
      validation: "valid"
    }
  ]);

  const categories = ["all", "Verduras", "Legumes", "Frutas", "Tubérculos"];

  const applyBulkUpdate = () => {
    setBulkItems(prev => prev.map(item => {
      if (!item.selected) return item;
      
      let newPrice = item.currentPrice;
      let change = 0;
      
      switch (updateMethod) {
        case "percentage":
          newPrice = item.currentPrice * (1 + percentageValue / 100);
          change = percentageValue;
          break;
        case "fixed":
          newPrice = item.currentPrice + fixedValue;
          change = (fixedValue / item.currentPrice) * 100;
          break;
      }
      
      // Validation logic
      let validation: "valid" | "warning" | "error" = "valid";
      let message = undefined;
      
      if (newPrice > item.currentPrice * 1.2) {
        validation = "warning";
        message = "Aumento superior a 20%";
      }
      if (newPrice < item.currentPrice * 0.8) {
        validation = "error";
        message = "Redução superior a 20%";
      }
      
      return {
        ...item,
        newPrice: Math.round(newPrice * 100) / 100,
        change: Math.round(change * 10) / 10,
        validation,
        message
      };
    }));
  };

  const toggleItemSelection = (id: string) => {
    setBulkItems(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const selectAllItems = () => {
    setBulkItems(prev => prev.map(item => ({ ...item, selected: true })));
  };

  const deselectAllItems = () => {
    setBulkItems(prev => prev.map(item => ({ ...item, selected: false })));
  };

  const filteredItems = bulkItems.filter(item => 
    selectedCategory === "all" || item.category === selectedCategory
  );

  const selectedCount = filteredItems.filter(item => item.selected).length;
  const totalImpact = filteredItems
    .filter(item => item.selected)
    .reduce((sum, item) => sum + (item.newPrice - item.currentPrice), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Atualização em Lote de Preços
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Atualize múltiplos preços simultaneamente com validação automática
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <UpdateMethodSelector
              updateMethod={updateMethod}
              setUpdateMethod={setUpdateMethod}
              percentageValue={percentageValue}
              setPercentageValue={setPercentageValue}
              fixedValue={fixedValue}
              setFixedValue={setFixedValue}
              csvData={csvData}
              setCsvData={setCsvData}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              onApplyUpdate={applyBulkUpdate}
            />

            <div className="md:col-span-2 space-y-4">
              <ItemPreview
                filteredItems={filteredItems}
                selectedCount={selectedCount}
                onToggleItemSelection={toggleItemSelection}
                onSelectAllItems={selectAllItems}
                onDeselectAllItems={deselectAllItems}
              />

              <ValidationSummary
                filteredItems={filteredItems}
                selectedCount={selectedCount}
                totalImpact={totalImpact}
              />

              <BulkControls selectedCount={selectedCount} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

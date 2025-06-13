
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Shield } from "lucide-react";
import { UpdateMethodSelector } from "./UpdateMethodSelector";
import { ItemPreview } from "./ItemPreview";
import { ValidationSummary } from "./ValidationSummary";
import { BulkControls } from "./BulkControls";
import { SecureForm } from "@/components/security/SecureForm";
import { validateNumber, validatePricingRule, logPriceChange, handleSecureError, sanitizeInput } from "@/utils/security";
import { toast } from "sonner";

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

  const handlePercentageChange = (value: number) => {
    try {
      if (!validateNumber(value, -50, 100)) {
        toast.error('Percentual deve estar entre -50% e 100%');
        return;
      }
      setPercentageValue(value);
    } catch (error) {
      handleSecureError(error, 'Erro ao validar percentual');
    }
  };

  const handleFixedValueChange = (value: number) => {
    try {
      if (!validateNumber(value, -999, 999)) {
        toast.error('Valor fixo deve estar entre -R$ 999,00 e R$ 999,00');
        return;
      }
      setFixedValue(value);
    } catch (error) {
      handleSecureError(error, 'Erro ao validar valor fixo');
    }
  };

  const handleCsvDataChange = (data: string) => {
    try {
      const sanitized = sanitizeInput(data);
      if (sanitized.length > 10000) {
        toast.error('Dados CSV muito grandes (máximo 10.000 caracteres)');
        return;
      }
      setCsvData(sanitized);
    } catch (error) {
      handleSecureError(error, 'Erro ao processar dados CSV');
    }
  };

  const applyBulkUpdate = () => {
    try {
      setBulkItems(prev => prev.map(item => {
        if (!item.selected) return item;
        
        let newPrice = item.currentPrice;
        let change = 0;
        
        switch (updateMethod) {
          case "percentage":
            if (!validateNumber(percentageValue, -50, 100)) {
              toast.error(`Percentual inválido para ${item.name}`);
              return item;
            }
            newPrice = item.currentPrice * (1 + percentageValue / 100);
            change = percentageValue;
            break;
          case "fixed":
            if (!validateNumber(fixedValue, -999, 999)) {
              toast.error(`Valor fixo inválido para ${item.name}`);
              return item;
            }
            newPrice = item.currentPrice + fixedValue;
            change = (fixedValue / item.currentPrice) * 100;
            break;
          case "csv":
            // Parse CSV data securely
            const lines = csvData.split('\n').filter(line => line.trim());
            const itemLine = lines.find(line => line.startsWith(item.id));
            if (itemLine) {
              const parts = itemLine.split(',');
              if (parts.length >= 2) {
                const csvPrice = parseFloat(parts[1]);
                if (validateNumber(csvPrice, 0.01, 9999)) {
                  newPrice = csvPrice;
                  change = ((csvPrice - item.currentPrice) / item.currentPrice) * 100;
                }
              }
            }
            break;
        }
        
        // Validate final price
        if (!validateNumber(newPrice, 0.01, 9999)) {
          return {
            ...item,
            validation: "error" as const,
            message: "Preço final inválido"
          };
        }
        
        // Business rule validation (estimate cost from current margin)
        const estimatedCost = item.currentPrice * 0.7; // Assume 30% margin
        const validation = validatePricingRule(newPrice, estimatedCost);
        
        let itemValidation: "valid" | "warning" | "error" = "valid";
        let message = undefined;
        
        if (!validation.valid) {
          itemValidation = "warning";
          message = validation.message;
        }
        
        // Additional validation rules
        if (Math.abs(change) > 20) {
          itemValidation = change > 20 ? "warning" : "error";
          message = `Mudança de ${change.toFixed(1)}% muito ${change > 0 ? 'alta' : 'baixa'}`;
        }
        
        return {
          ...item,
          newPrice: Math.round(newPrice * 100) / 100,
          change: Math.round(change * 10) / 10,
          validation: itemValidation,
          message
        };
      }));

      toast.success('Atualização aplicada com validação de segurança');
    } catch (error) {
      handleSecureError(error, 'Erro ao aplicar atualização em lote');
    }
  };

  const toggleItemSelection = (id: string) => {
    try {
      setBulkItems(prev => prev.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      ));
    } catch (error) {
      handleSecureError(error, 'Erro ao selecionar item');
    }
  };

  const selectAllItems = () => {
    setBulkItems(prev => prev.map(item => ({ ...item, selected: true })));
  };

  const deselectAllItems = () => {
    setBulkItems(prev => prev.map(item => ({ ...item, selected: false })));
  };

  const handleConfirmUpdates = async (data: any, csrfToken: string) => {
    try {
      const selectedItems = filteredItems.filter(item => item.selected);
      
      // Log all price changes
      selectedItems.forEach(item => {
        logPriceChange(item.id, item.currentPrice, item.newPrice);
      });

      // In production, this would make secure API calls
      toast.success(`${selectedItems.length} preços atualizados com segurança`);
    } catch (error) {
      handleSecureError(error, 'Erro ao confirmar atualizações');
    }
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
            <Shield className="h-4 w-4 text-green-600" />
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Atualize múltiplos preços com validação de segurança e auditoria integradas
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <UpdateMethodSelector
              updateMethod={updateMethod}
              setUpdateMethod={setUpdateMethod}
              percentageValue={percentageValue}
              setPercentageValue={handlePercentageChange}
              fixedValue={fixedValue}
              setFixedValue={handleFixedValueChange}
              csvData={csvData}
              setCsvData={handleCsvDataChange}
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

              <SecureForm onSubmit={handleConfirmUpdates} formId="bulk-price-update">
                <BulkControls selectedCount={selectedCount} />
              </SecureForm>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

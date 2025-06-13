
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody } from "@/components/ui/table";
import { Save, RefreshCw, Shield } from "lucide-react";
import { PricingTableHeader } from "./PricingTableHeader";
import { PricingTableRow } from "./PricingTableRow";
import { SecureForm } from "@/components/security/SecureForm";
import { validateNumber, validatePricingRule, logPriceChange, handleSecureError, formatSecureNumber } from "@/utils/security";
import { toast } from "sonner";

interface PriceItem {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  suggestedPrice: number;
  lastUpdated: string;
  margin: number;
  perishability: number;
  marketTrend: "up" | "down" | "stable";
  status: "normal" | "critical" | "opportunity";
}

export function QuickPricingTable() {
  const [priceData, setPriceData] = useState<PriceItem[]>([
    {
      id: "P001",
      name: "Alface hidropônica",
      category: "Verduras",
      currentPrice: 4.80,
      suggestedPrice: 5.20,
      lastUpdated: "2024-01-16 08:30",
      margin: 35,
      perishability: 85,
      marketTrend: "up",
      status: "opportunity"
    },
    {
      id: "P002",
      name: "Tomate grape",
      category: "Legumes",
      currentPrice: 7.50,
      suggestedPrice: 8.20,
      lastUpdated: "2024-01-16 09:15",
      margin: 42,
      perishability: 75,
      marketTrend: "up",
      status: "normal"
    },
    {
      id: "P003",
      name: "Moranguinho",
      category: "Frutas",
      currentPrice: 14.00,
      suggestedPrice: 13.50,
      lastUpdated: "2024-01-15 16:45",
      margin: 38,
      perishability: 60,
      marketTrend: "down",
      status: "critical"
    },
    {
      id: "P004",
      name: "Alho descascado 500g",
      category: "Temperos",
      currentPrice: 15.50,
      suggestedPrice: 16.80,
      lastUpdated: "2024-01-14 14:20",
      margin: 48,
      perishability: 95,
      marketTrend: "stable",
      status: "opportunity"
    }
  ]);

  const updatePrice = (id: string, newPrice: number) => {
    try {
      // Validate input
      if (!validateNumber(newPrice, 0.01, 9999)) {
        toast.error('Preço deve estar entre R$ 0,01 e R$ 9.999,00');
        return;
      }

      const item = priceData.find(p => p.id === id);
      if (!item) {
        handleSecureError(new Error('Item not found'), 'Produto não encontrado');
        return;
      }

      // Estimate cost from current margin (for business rule validation)
      const estimatedCost = item.currentPrice * (1 - item.margin / 100);
      const validation = validatePricingRule(newPrice, estimatedCost);
      
      if (!validation.valid) {
        toast.error(validation.message);
        return;
      }

      // Log price change for audit
      logPriceChange(id, item.currentPrice, newPrice);

      setPriceData(prev => prev.map(priceItem => 
        priceItem.id === id 
          ? { 
              ...priceItem, 
              currentPrice: newPrice, 
              lastUpdated: new Date().toLocaleString('pt-BR'),
              margin: Math.round(((newPrice - estimatedCost) / newPrice) * 100)
            }
          : priceItem
      ));

      toast.success(`Preço atualizado para R$ ${formatSecureNumber(newPrice)}`);
    } catch (error) {
      handleSecureError(error, 'Erro ao atualizar preço');
    }
  };

  const applySuggestedPrice = (id: string) => {
    try {
      const item = priceData.find(p => p.id === id);
      if (item) {
        updatePrice(id, item.suggestedPrice);
      }
    } catch (error) {
      handleSecureError(error, 'Erro ao aplicar preço sugerido');
    }
  };

  const handleSaveAll = async (data: any, csrfToken: string) => {
    try {
      // In production, this would make a secure API call with CSRF token
      toast.success('Todos os preços foram salvos com segurança');
      
      // Log bulk update
      logPriceChange('BULK_UPDATE', 0, priceData.length, 'current_user');
    } catch (error) {
      handleSecureError(error, 'Erro ao salvar preços');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Atualização Rápida de Preços
              <Shield className="h-4 w-4 text-green-600" title="Sistema Seguro" />
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Ajuste preços rapidamente com validação e segurança integradas
            </p>
          </div>
          <SecureForm onSubmit={handleSaveAll} formId="save-all-prices">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Salvar Todas
            </Button>
          </SecureForm>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <PricingTableHeader />
          <TableBody>
            {priceData.map((item) => (
              <PricingTableRow
                key={item.id}
                item={item}
                onUpdatePrice={updatePrice}
                onApplySuggestedPrice={applySuggestedPrice}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

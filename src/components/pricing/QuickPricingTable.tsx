
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody } from "@/components/ui/table";
import { Save, RefreshCw } from "lucide-react";
import { PricingTableHeader } from "./PricingTableHeader";
import { PricingTableRow } from "./PricingTableRow";

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
    setPriceData(prev => prev.map(item => 
      item.id === id 
        ? { ...item, currentPrice: newPrice, lastUpdated: new Date().toLocaleString('pt-BR') }
        : item
    ));
  };

  const applySuggestedPrice = (id: string) => {
    const item = priceData.find(p => p.id === id);
    if (item) {
      updatePrice(id, item.suggestedPrice);
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
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Ajuste preços rapidamente com base em sugestões automáticas
            </p>
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Salvar Todas
          </Button>
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

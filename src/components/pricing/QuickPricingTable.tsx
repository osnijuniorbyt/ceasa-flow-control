
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Save, RefreshCw, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Crítico</Badge>;
      case "opportunity":
        return <Badge className="bg-green-100 text-green-800">Oportunidade</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Normal</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
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
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Preço Atual</TableHead>
              <TableHead>Preço Sugerido</TableHead>
              <TableHead>Margem</TableHead>
              <TableHead>Tendência</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {priceData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.category}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.currentPrice}
                    onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                    className="w-20"
                    step="0.01"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">R$ {item.suggestedPrice.toFixed(2)}</span>
                    {Math.abs(item.currentPrice - item.suggestedPrice) > 0.1 && (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${
                    item.margin >= 40 ? 'text-green-600' : 
                    item.margin >= 30 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {item.margin}%
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(item.marketTrend)}
                    <span className="text-sm capitalize">{item.marketTrend === "stable" ? "Estável" : item.marketTrend === "up" ? "Alta" : "Baixa"}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => applySuggestedPrice(item.id)}
                      disabled={Math.abs(item.currentPrice - item.suggestedPrice) < 0.01}
                    >
                      Aplicar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

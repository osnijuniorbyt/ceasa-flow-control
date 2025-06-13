
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calculator, TrendingUp, AlertTriangle, Target, DollarSign } from "lucide-react";

export function PricingRecommendations() {
  const pricingSuggestions = [
    {
      productId: "P001",
      productName: "Alface hidroponica",
      realCostPerKg: 3.20,
      suggestedSellingPrice: 5.50,
      currentPrice: 4.80,
      targetMargin: 45,
      actualMargin: 33,
      perishabilityFactor: 0.85,
      marketConditions: "Demanda alta, oferta estável",
      competitorPrice: 5.20,
      profitProjection: 460,
      marginAlert: "Margem abaixo do target - aumentar preço"
    },
    {
      productId: "P002",
      productName: "Tomate grape",
      realCostPerKg: 4.50,
      suggestedSellingPrice: 8.90,
      currentPrice: 7.50,
      targetMargin: 50,
      actualMargin: 40,
      perishabilityFactor: 0.75,
      marketConditions: "Preços em alta no mercado",
      competitorPrice: 8.20,
      profitProjection: 320,
      marginAlert: null
    },
    {
      productId: "P003",
      productName: "Moranguinho",
      realCostPerKg: 8.20,
      suggestedSellingPrice: 15.50,
      currentPrice: 14.00,
      targetMargin: 47,
      actualMargin: 41,
      perishabilityFactor: 0.60,
      marketConditions: "Alta perecibilidade, ajustar rápido",
      competitorPrice: 16.00,
      profitProjection: 280,
      marginAlert: "Produto expirando - considerar promoção"
    }
  ];

  const getMarginColor = (actual: number, target: number) => {
    const ratio = actual / target;
    if (ratio >= 0.95) return "text-green-600";
    if (ratio >= 0.8) return "text-yellow-600";
    return "text-red-600";
  };

  const getAlertColor = (alert: string | null) => {
    if (!alert) return "";
    if (alert.includes("expirando")) return "bg-red-100 text-red-800";
    if (alert.includes("abaixo")) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Precificação Inteligente
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Preços otimizados baseados em custo real, perecibilidade e mercado
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {pricingSuggestions.map((item) => (
              <div key={item.productId} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{item.productName}</h3>
                    {item.marginAlert && (
                      <Badge className={getAlertColor(item.marginAlert)}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Alerta
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Preço Sugerido:</div>
                    <div className="text-2xl font-bold text-primary">
                      R$ {item.suggestedSellingPrice.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Custos e Preços
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Custo real/kg:</span>
                        <span className="font-medium">R$ {item.realCostPerKg.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Preço atual:</span>
                        <span>R$ {item.currentPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Concorrência:</span>
                        <span>R$ {item.competitorPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Análise de Margem
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Meta:</span>
                        <span className="text-sm font-medium">{item.targetMargin}%</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Atual:</span>
                          <span className={`text-sm font-medium ${getMarginColor(item.actualMargin, item.targetMargin)}`}>
                            {item.actualMargin}%
                          </span>
                        </div>
                        <Progress 
                          value={(item.actualMargin / item.targetMargin) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Projeções
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Perecibilidade:</span>
                        <span className="font-medium">{(item.perishabilityFactor * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lucro proj.:</span>
                        <span className="font-medium text-green-600">R$ {item.profitProjection}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {item.marketConditions}
                      </div>
                    </div>
                  </div>
                </div>

                {item.marginAlert && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.marginAlert}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1">
                    Aplicar Preço Sugerido
                  </Button>
                  <Button variant="outline">
                    Ajustar Manualmente
                  </Button>
                  <Button variant="ghost">
                    Ver Histórico
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

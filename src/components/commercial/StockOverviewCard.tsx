
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

export function StockOverviewCard() {
  const stockPredictions = [
    {
      product: "Alface hidroponica",
      currentStock: 15,
      depletionDays: 2.3,
      suggestedOrder: 25,
      trend: "up",
      confidence: 92
    },
    {
      product: "Tomate grape",
      currentStock: 3,
      depletionDays: 0.8,
      suggestedOrder: 50,
      trend: "critical",
      confidence: 95
    },
    {
      product: "Moranguinho",
      currentStock: 12,
      depletionDays: 4.1,
      suggestedOrder: 0,
      trend: "stable",
      confidence: 88
    },
    {
      product: "Batata doce branca",
      currentStock: 2,
      depletionDays: 1.2,
      suggestedOrder: 35,
      trend: "critical",
      confidence: 91
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "critical": return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "stable": return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <TrendingDown className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "bg-green-100 text-green-800";
      case "critical": return "bg-red-100 text-red-800";
      case "stable": return "bg-blue-100 text-blue-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Estoque com Predições IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stockPredictions.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{item.product}</h4>
                  {getTrendIcon(item.trend)}
                  <Badge className={getTrendColor(item.trend)}>
                    {item.depletionDays.toFixed(1)} dias
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  Estoque atual: {item.currentStock} unidades
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs">Confiança:</span>
                  <Progress value={item.confidence} className="flex-1 h-2" />
                  <span className="text-xs font-medium">{item.confidence}%</span>
                </div>
              </div>
              
              <div className="text-right ml-4">
                {item.suggestedOrder > 0 ? (
                  <div>
                    <div className="text-sm font-medium text-blue-600">
                      Sugestão IA
                    </div>
                    <div className="text-lg font-bold">
                      {item.suggestedOrder} un
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-green-600 font-medium">
                    Estoque OK
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

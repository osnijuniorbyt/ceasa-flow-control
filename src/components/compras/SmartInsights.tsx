
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Award, AlertTriangle, Gift, Lightbulb } from "lucide-react";
import { PurchaseInsight } from "@/types/compras";

export function SmartInsights() {
  const insights: PurchaseInsight[] = [
    {
      type: "top_seller",
      title: "Produto com maior giro",
      description: "Alface hidropônica (vendas diárias: 8cx)",
      priority: "high",
      actionable: true
    },
    {
      type: "best_supplier",
      title: "Fornecedor mais confiável",
      description: "D22 rua (98% pontualidade)",
      priority: "medium",
      actionable: false
    },
    {
      type: "price_alert",
      title: "Alerta de preço",
      description: "Preço do tomate subiu 25% esta semana",
      priority: "high",
      actionable: true
    },
    {
      type: "promotion",
      title: "Oportunidade",
      description: "E10 tem promoção de morango - aproveite!",
      priority: "medium",
      actionable: true
    }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "top_seller": return <TrendingUp className="h-4 w-4" />;
      case "best_supplier": return <Award className="h-4 w-4" />;
      case "price_alert": return <AlertTriangle className="h-4 w-4" />;
      case "promotion": return <Gift className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Insights Inteligentes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Análises automáticas para otimizar suas compras
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 border rounded-lg bg-card"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getInsightIcon(insight.type)}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getPriorityColor(insight.priority)}`}
                  >
                    {insight.priority === "high" ? "Alta" : 
                     insight.priority === "medium" ? "Média" : "Baixa"}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {insight.description}
                </p>
                
                {insight.actionable && (
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Ver Detalhes
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

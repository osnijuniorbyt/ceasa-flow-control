
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, CloudRain, Users, Target, Clock } from "lucide-react";

export function AIInsightsPanel() {
  const insights = [
    {
      id: "1",
      type: "performance" as const,
      message: "Alface vendendo 30% mais rápido esta semana",
      priority: "high" as const,
      actionRequired: true,
      timestamp: "Há 15 min",
      action: "Aumentar pedido para segunda"
    },
    {
      id: "2",  
      type: "market" as const,
      message: "Moranguinho com margem em queda - verificar qualidade",
      priority: "critical" as const,
      actionRequired: true,
      timestamp: "Há 25 min",
      action: "Inspecionar lote atual"
    },
    {
      id: "3",
      type: "weather" as const,
      message: "Previsão de chuva - estocar produtos de prateleira",
      priority: "medium" as const,
      actionRequired: true,
      timestamp: "Há 1h",
      action: "Revisar pedidos de não-perecíveis"
    },
    {
      id: "4",
      type: "competition" as const,
      message: "Concorrente aumentou tomate 20% - oportunidade",
      priority: "high" as const,
      actionRequired: true,
      timestamp: "Há 2h",
      action: "Manter preço competitivo"
    },
    {
      id: "5",
      type: "expiry" as const,
      message: "3 produtos vencendo amanhã - sugerir promoção",
      priority: "critical" as const,
      actionRequired: true,
      timestamp: "Há 30 min",
      action: "Criar campanha promocional"
    },
    {
      id: "6",
      type: "opportunity" as const,
      message: "Batata doce: demanda família +50% fim de semana",
      priority: "medium" as const,
      actionRequired: false,
      timestamp: "Há 45 min",
      action: "Aumentar estoque para sábado"
    }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "performance": return <TrendingUp className="h-4 w-4" />;
      case "market": return <Target className="h-4 w-4" />;
      case "weather": return <CloudRain className="h-4 w-4" />;
      case "competition": return <Users className="h-4 w-4" />;
      case "expiry": return <Clock className="h-4 w-4" />;
      case "opportunity": return <Brain className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "performance": return "text-green-600";
      case "market": return "text-blue-600";
      case "weather": return "text-cyan-600";
      case "competition": return "text-purple-600";
      case "expiry": return "text-red-600";
      case "opportunity": return "text-emerald-600";
      default: return "text-gray-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Insights IA em Tempo Real
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Análises automáticas e alertas inteligentes
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {insights.map((insight) => (
            <div key={insight.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  <div className={getTypeColor(insight.type)}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{insight.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.timestamp}
                    </p>
                  </div>
                </div>
                <Badge className={getPriorityColor(insight.priority)}>
                  {insight.priority === "critical" ? "Crítico" :
                   insight.priority === "high" ? "Alto" :
                   insight.priority === "medium" ? "Médio" : "Baixo"}
                </Badge>
              </div>
              
              {insight.actionRequired && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    Ação sugerida: {insight.action}
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Executar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                      Ignorar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            {insights.filter(i => i.priority === "critical").length} críticos, {insights.filter(i => i.actionRequired).length} ações pendentes
          </span>
          <Button variant="outline" size="sm">
            Ver Todos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

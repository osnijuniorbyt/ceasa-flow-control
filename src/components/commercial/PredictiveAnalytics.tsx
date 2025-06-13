
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Users, Target } from "lucide-react";

export function PredictiveAnalytics() {
  const demandForecast = [
    { date: "Hoje", expectedDemand: 100, weatherFactor: 1.2, confidence: 95 },
    { date: "Amanhã", expectedDemand: 85, weatherFactor: 1.0, confidence: 92 },
    { date: "Sábado", expectedDemand: 140, weatherFactor: 1.1, confidence: 88 },
    { date: "Domingo", expectedDemand: 110, weatherFactor: 1.0, confidence: 85 },
    { date: "Segunda", expectedDemand: 120, weatherFactor: 0.9, confidence: 90 }
  ];

  const optimalOrders = [
    { product: "Tomate grape", quantity: 50, timing: "Hoje à tarde", urgency: "critical" },
    { product: "Batata doce", quantity: 35, timing: "Amanhã cedo", urgency: "high" },
    { product: "Alface", quantity: 25, timing: "Segunda", urgency: "medium" }
  ];

  const bestSuppliers = [
    { name: "D22 rua", product: "Alface", reliability: 95, price: 92, score: 93 },
    { name: "E10", product: "Tomate", reliability: 88, price: 85, score: 86 },
    { name: "F59", product: "Morango", reliability: 92, price: 78, score: 85 }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600";
    if (confidence >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Previsão de Demanda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {demandForecast.map((forecast, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{forecast.date}</div>
                  <div className="text-sm text-muted-foreground">
                    Fator clima: {forecast.weatherFactor}x
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{forecast.expectedDemand}%</div>
                  <div className={`text-xs ${getConfidenceColor(forecast.confidence)}`}>
                    {forecast.confidence}% confiança
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Pedidos Otimizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optimalOrders.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{order.product}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.timing}
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div className="text-lg font-bold">{order.quantity} kg</div>
                  <Badge className={getUrgencyColor(order.urgency)}>
                    {order.urgency === "critical" ? "Crítico" :
                     order.urgency === "high" ? "Alto" : "Médio"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Melhores Fornecedores por Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {bestSuppliers.map((supplier, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{supplier.name}</h3>
                  <Badge className="bg-green-100 text-green-800">
                    Score: {supplier.score}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Produto:</span>
                    <span className="font-medium">{supplier.product}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confiabilidade:</span>
                    <span className={getConfidenceColor(supplier.reliability)}>
                      {supplier.reliability}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Competitividade:</span>
                    <span className={getConfidenceColor(supplier.price)}>
                      {supplier.price}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

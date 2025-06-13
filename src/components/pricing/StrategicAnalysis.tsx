
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Target,
  BarChart3,
  Calendar
} from "lucide-react";

interface AnalysisItem {
  id: string;
  name: string;
  category: string;
  perishabilityScore: number;
  daysToExpiry: number;
  competitorPrice: number;
  ourPrice: number;
  demandLevel: "low" | "medium" | "high";
  priceElasticity: number;
  recommendation: string;
  urgency: "low" | "medium" | "high";
  potentialRevenue: number;
}

export function StrategicAnalysis() {
  const analysisData: AnalysisItem[] = [
    {
      id: "P001",
      name: "Alface hidropônica",
      category: "Verduras",
      perishabilityScore: 85,
      daysToExpiry: 3,
      competitorPrice: 5.20,
      ourPrice: 4.80,
      demandLevel: "high",
      priceElasticity: 0.7,
      recommendation: "Aumentar preço para R$ 5.10 - demanda alta permite aumento",
      urgency: "medium",
      potentialRevenue: 145
    },
    {
      id: "P002",
      name: "Moranguinho",
      category: "Frutas",
      perishabilityScore: 60,
      daysToExpiry: 1,
      competitorPrice: 16.00,
      ourPrice: 14.00,
      demandLevel: "medium",
      priceElasticity: 1.2,
      recommendation: "Promoção urgente - vencimento próximo, reduzir para R$ 12.50",
      urgency: "high",
      potentialRevenue: -85
    },
    {
      id: "P003",
      name: "Batata doce branca",
      category: "Tubérculos",
      perishabilityScore: 95,
      daysToExpiry: 8,
      competitorPrice: 4.50,
      ourPrice: 4.20,
      demandLevel: "low",
      priceElasticity: 0.9,
      recommendation: "Manter preço atual - produto durável, aguardar aumento de demanda",
      urgency: "low",
      potentialRevenue: 25
    },
    {
      id: "P004",
      name: "Tomate grape",
      category: "Legumes",
      perishabilityScore: 75,
      daysToExpiry: 4,
      competitorPrice: 8.20,
      ourPrice: 7.50,
      demandLevel: "high",
      priceElasticity: 0.8,
      recommendation: "Aumentar gradualmente para R$ 7.90 - demanda sustenta aumento",
      urgency: "medium",
      potentialRevenue: 180
    }
  ];

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">Alta</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800">Baixa</Badge>;
    }
  };

  const getDemandBadge = (demand: string) => {
    switch (demand) {
      case "high":
        return <Badge className="bg-green-100 text-green-800">Alta</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Baixa</Badge>;
    }
  };

  const getPerishabilityColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise Estratégica de Precificação
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Análise detalhada considerando perecibilidade, concorrência e elasticidade de demanda
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analysisData.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getUrgencyBadge(item.urgency)}
                    {item.daysToExpiry <= 2 && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Perecibilidade
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Score:</span>
                        <span className={`font-medium ${getPerishabilityColor(item.perishabilityScore)}`}>
                          {item.perishabilityScore}%
                        </span>
                      </div>
                      <Progress value={item.perishabilityScore} className="h-2" />
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">{item.daysToExpiry} dias para vencer</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Preços
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Nosso preço:</span>
                        <span className="font-medium">R$ {item.ourPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Concorrência:</span>
                        <span className="font-medium">R$ {item.competitorPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Diferença:</span>
                        <span className={`font-medium ${
                          item.ourPrice < item.competitorPrice ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {((item.ourPrice - item.competitorPrice) / item.competitorPrice * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Demanda
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Nível:</span>
                        {getDemandBadge(item.demandLevel)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Elasticidade:</span>
                        <span className="font-medium">{item.priceElasticity.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Impacto</h4>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Receita potencial:</span>
                        <span className={`font-medium ${
                          item.potentialRevenue >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.potentialRevenue >= 0 ? '+' : ''}R$ {item.potentialRevenue}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-blue-800">Recomendação Estratégica</div>
                      <div className="text-sm text-blue-700 mt-1">{item.recommendation}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1">
                    Aplicar Recomendação
                  </Button>
                  <Button variant="outline">
                    Simular Impacto
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

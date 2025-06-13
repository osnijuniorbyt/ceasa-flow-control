
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { AnalysisCard, AnalysisItem } from "./AnalysisCard";

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
              <AnalysisCard key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { PerishabilitySection } from "./PerishabilitySection";
import { PriceSection } from "./PriceSection";
import { DemandSection } from "./DemandSection";
import { ImpactSection } from "./ImpactSection";
import { RecommendationPanel } from "./RecommendationPanel";

export interface AnalysisItem {
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

interface AnalysisCardProps {
  item: AnalysisItem;
}

export function AnalysisCard({ item }: AnalysisCardProps) {
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

  return (
    <div className="border rounded-lg p-4 space-y-4">
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
        <PerishabilitySection 
          score={item.perishabilityScore}
          daysToExpiry={item.daysToExpiry}
        />
        <PriceSection 
          ourPrice={item.ourPrice}
          competitorPrice={item.competitorPrice}
        />
        <DemandSection 
          demandLevel={item.demandLevel}
          priceElasticity={item.priceElasticity}
        />
        <ImpactSection potentialRevenue={item.potentialRevenue} />
      </div>

      <RecommendationPanel recommendation={item.recommendation} />

      <div className="flex gap-2 pt-2">
        <Button className="flex-1">
          Aplicar Recomendação
        </Button>
        <Button variant="outline">
          Simular Impacto
        </Button>
      </div>
    </div>
  );
}

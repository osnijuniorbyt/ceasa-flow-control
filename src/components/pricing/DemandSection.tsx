
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface DemandSectionProps {
  demandLevel: "low" | "medium" | "high";
  priceElasticity: number;
}

export function DemandSection({ demandLevel, priceElasticity }: DemandSectionProps) {
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

  return (
    <div className="space-y-2">
      <h4 className="font-medium flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Demanda
      </h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Nível:</span>
          {getDemandBadge(demandLevel)}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Elasticidade:</span>
          <span className="font-medium">{priceElasticity.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

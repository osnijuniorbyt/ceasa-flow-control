
import { Target } from "lucide-react";

interface PriceSectionProps {
  ourPrice: number;
  competitorPrice: number;
}

export function PriceSection({ ourPrice, competitorPrice }: PriceSectionProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium flex items-center gap-2">
        <Target className="h-4 w-4" />
        Preços
      </h4>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Nosso preço:</span>
          <span className="font-medium">R$ {ourPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Concorrência:</span>
          <span className="font-medium">R$ {competitorPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Diferença:</span>
          <span className={`font-medium ${
            ourPrice < competitorPrice ? 'text-green-600' : 'text-red-600'
          }`}>
            {((ourPrice - competitorPrice) / competitorPrice * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}


import { BarChart3 } from "lucide-react";
import { SimulationResults } from "./SimulationResults";
import { SimulationSummary } from "./SimulationSummary";

interface SimulationResult {
  newPrice: number;
  margin: number;
  revenueChange: number;
  unitsSoldChange: number;
  totalProfit: number;
  breakEvenUnits: number;
}

interface PricingResultsProps {
  simulation: SimulationResult;
  currentPrice: number;
  cost: number;
}

export function PricingResults({ simulation, currentPrice, cost }: PricingResultsProps) {
  const currentMargin = ((currentPrice - cost) / currentPrice) * 100;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        Resultados da Simulação
      </h3>

      <SimulationResults 
        simulation={simulation}
        currentPrice={currentPrice}
        cost={cost}
      />

      <SimulationSummary
        currentPrice={currentPrice}
        newPrice={simulation.newPrice}
        currentMargin={currentMargin}
        newMargin={simulation.margin}
        breakEvenUnits={simulation.breakEvenUnits}
      />
    </div>
  );
}


import { Card, CardContent } from "@/components/ui/card";
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  Calculator 
} from "lucide-react";

interface SimulationResult {
  newPrice: number;
  margin: number;
  revenueChange: number;
  unitsSoldChange: number;
  totalProfit: number;
  breakEvenUnits: number;
}

interface SimulationResultsProps {
  simulation: SimulationResult;
  currentPrice: number;
  cost: number;
}

export function SimulationResults({ simulation, currentPrice, cost }: SimulationResultsProps) {
  const currentMargin = ((currentPrice - cost) / currentPrice) * 100;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Margem</span>
          </div>
          <div className="text-2xl font-bold">
            {simulation.margin.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            Atual: {currentMargin.toFixed(1)}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Receita</span>
          </div>
          <div className="text-2xl font-bold">
            {simulation.revenueChange >= 0 ? '+' : ''}
            {simulation.revenueChange.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            Mudança esperada
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Volume</span>
          </div>
          <div className="text-2xl font-bold">
            {simulation.unitsSoldChange >= 0 ? '+' : ''}
            {simulation.unitsSoldChange.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            Unidades vendidas
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">Lucro</span>
          </div>
          <div className="text-2xl font-bold">
            {simulation.totalProfit >= 0 ? '+' : ''}
            R$ {simulation.totalProfit.toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground">
            Diferença mensal
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

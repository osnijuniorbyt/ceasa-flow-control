
import { Button } from "@/components/ui/button";

interface SimulationSummaryProps {
  currentPrice: number;
  newPrice: number;
  currentMargin: number;
  newMargin: number;
  breakEvenUnits: number;
}

export function SimulationSummary({
  currentPrice,
  newPrice,
  currentMargin,
  newMargin,
  breakEvenUnits
}: SimulationSummaryProps) {
  return (
    <div className="space-y-3">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Resumo do Cenário</h4>
        <div className="space-y-1 text-sm text-blue-700">
          <div>• Preço: R$ {currentPrice.toFixed(2)} → R$ {newPrice.toFixed(2)}</div>
          <div>• Margem: {currentMargin.toFixed(1)}% → {newMargin.toFixed(1)}%</div>
          <div>• Break-even: {breakEvenUnits} unidades</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1">
          Aplicar Novo Preço
        </Button>
        <Button variant="outline">
          Salvar Cenário
        </Button>
      </div>
    </div>
  );
}

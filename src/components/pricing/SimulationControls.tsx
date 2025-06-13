
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface SimulationControlsProps {
  currentPrice: number;
  setCurrentPrice: (price: number) => void;
  cost: number;
  setCost: (cost: number) => void;
  currentUnits: number;
  setCurrentUnits: (units: number) => void;
  targetPrice: number[];
  setTargetPrice: (price: number[]) => void;
  priceElasticity: number[];
  setPriceElasticity: (elasticity: number[]) => void;
  onReset: () => void;
}

export function SimulationControls({
  currentPrice,
  setCurrentPrice,
  cost,
  setCost,
  currentUnits,
  setCurrentUnits,
  targetPrice,
  setTargetPrice,
  priceElasticity,
  setPriceElasticity,
  onReset
}: SimulationControlsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currentPrice">Preço Atual (R$)</Label>
          <Input
            id="currentPrice"
            type="number"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(parseFloat(e.target.value) || 0)}
            step="0.01"
          />
        </div>
        <div>
          <Label htmlFor="cost">Custo (R$)</Label>
          <Input
            id="cost"
            type="number"
            value={cost}
            onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
            step="0.01"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="units">Unidades Vendidas (mês)</Label>
        <Input
          id="units"
          type="number"
          value={currentUnits}
          onChange={(e) => setCurrentUnits(parseInt(e.target.value) || 0)}
        />
      </div>

      <div>
        <Label>Novo Preço: R$ {targetPrice[0].toFixed(2)}</Label>
        <Slider
          value={targetPrice}
          onValueChange={setTargetPrice}
          max={currentPrice * 2}
          min={cost * 1.1}
          step={0.05}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>R$ {(cost * 1.1).toFixed(2)}</span>
          <span>R$ {(currentPrice * 2).toFixed(2)}</span>
        </div>
      </div>

      <div>
        <Label>Elasticidade de Preço: {priceElasticity[0].toFixed(1)}</Label>
        <Slider
          value={priceElasticity}
          onValueChange={setPriceElasticity}
          max={2}
          min={0.1}
          step={0.1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Inelástico (0.1)</span>
          <span>Muito Elástico (2.0)</span>
        </div>
      </div>

      <Button onClick={onReset} variant="outline" className="w-full">
        <RefreshCw className="h-4 w-4 mr-2" />
        Resetar Simulação
      </Button>
    </div>
  );
}

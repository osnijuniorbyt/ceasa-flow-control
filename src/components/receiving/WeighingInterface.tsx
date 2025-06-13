
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Scale, Calculator, AlertTriangle } from "lucide-react";
import { ProductReceiving, WeighingRecord, Container, Divergence } from "@/types/receiving";

interface WeighingInterfaceProps {
  product: ProductReceiving;
  onWeighingComplete: (record: WeighingRecord) => void;
}

const containers: Container[] = [
  { code: "CPL", name: "Caixa Plástica Lisa", weight: 2.0 },
  { code: "CMA", name: "Caixa Madeira", weight: 2.5 },
  { code: "CMP", name: "Caixa Plástica Pequena", weight: 0.5 },
  { code: "CPA", name: "Caixa Plástica Alta", weight: 1.5 },
  { code: "CPP", name: "Caixa Plástica Perfurada", weight: 0.8 }
];

export function WeighingInterface({ product, onWeighingComplete }: WeighingInterfaceProps) {
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [grossWeight, setGrossWeight] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [netWeight, setNetWeight] = useState<number>(0);
  const [divergence, setDivergence] = useState<Divergence | null>(null);

  const calculateNetWeight = (gross: number, containerWeight: number) => {
    return Math.max(0, gross - containerWeight);
  };

  const checkDivergence = (actualWeight: number, actualQuantity: number): Divergence | null => {
    if (!product.expectedWeight && !product.expectedQuantity) return null;

    let divergence: Divergence | null = null;

    // Check weight divergence
    if (product.expectedWeight) {
      const weightDiff = Math.abs(actualWeight - product.expectedWeight);
      const weightPercentage = (weightDiff / product.expectedWeight) * 100;
      
      if (weightPercentage > 10) {
        divergence = {
          type: 'weight',
          expected: product.expectedWeight,
          actual: actualWeight,
          percentage: weightPercentage,
          severity: weightPercentage > 20 ? 'high' : 'medium'
        };
      }
    }

    // Check quantity divergence
    if (product.expectedQuantity) {
      const quantityDiff = Math.abs(actualQuantity - product.expectedQuantity);
      const quantityPercentage = (quantityDiff / product.expectedQuantity) * 100;
      
      if (quantityPercentage > 5) {
        const quantityDivergence: Divergence = {
          type: 'quantity',
          expected: product.expectedQuantity,
          actual: actualQuantity,
          percentage: quantityPercentage,
          severity: quantityPercentage > 15 ? 'high' : 'medium'
        };
        
        if (!divergence || quantityDivergence.severity === 'high') {
          divergence = quantityDivergence;
        }
      }
    }

    return divergence;
  };

  const handleGrossWeightChange = (value: string) => {
    setGrossWeight(value);
    if (selectedContainer && value) {
      const gross = parseFloat(value);
      const net = calculateNetWeight(gross, selectedContainer.weight);
      setNetWeight(net);
      
      // Check for divergences when we have all required data
      if (quantity) {
        const actualQuantity = parseInt(quantity);
        const div = checkDivergence(net, actualQuantity);
        setDivergence(div);
      }
    }
  };

  const handleQuantityChange = (value: string) => {
    setQuantity(value);
    if (netWeight > 0 && value) {
      const actualQuantity = parseInt(value);
      const div = checkDivergence(netWeight, actualQuantity);
      setDivergence(div);
    }
  };

  const handleContainerChange = (containerCode: string) => {
    const container = containers.find(c => c.code === containerCode);
    setSelectedContainer(container || null);
    
    if (container && grossWeight) {
      const gross = parseFloat(grossWeight);
      const net = calculateNetWeight(gross, container.weight);
      setNetWeight(net);
      
      if (quantity) {
        const actualQuantity = parseInt(quantity);
        const div = checkDivergence(net, actualQuantity);
        setDivergence(div);
      }
    }
  };

  const handleSubmit = () => {
    if (!selectedContainer || !grossWeight || !quantity) return;

    const record: WeighingRecord = {
      id: `WR-${Date.now()}`,
      productId: product.id,
      containerType: `${selectedContainer.code} (${selectedContainer.weight}kg)`,
      grossWeight: parseFloat(grossWeight),
      netWeight,
      quantity: parseInt(quantity),
      timestamp: new Date(),
      conferente: "Conferente", // In real app, get from auth
      hasDivergence: !!divergence,
      divergenceReason: divergence ? `${divergence.type}: ${divergence.percentage.toFixed(1)}% diferença` : undefined
    };

    onWeighingComplete(record);
    
    // Reset form
    setSelectedContainer(null);
    setGrossWeight("");
    setQuantity("");
    setNetWeight(0);
    setDivergence(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Pesagem - {product.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium mb-1">Produto Selecionado</div>
          <div className="text-sm text-muted-foreground">
            {product.expectedQuantity} {product.unit}
            {product.expectedWeight && ` | ${product.expectedWeight} kg esperados`}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="container">Tipo de Container</Label>
            <Select onValueChange={handleContainerChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o container" />
              </SelectTrigger>
              <SelectContent>
                {containers.map((container) => (
                  <SelectItem key={container.code} value={container.code}>
                    {container.code} - {container.name} ({container.weight}kg)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedContainer && (
              <div className="text-xs text-muted-foreground mt-1">
                Peso do container: {selectedContainer.weight}kg
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="grossWeight">Peso Bruto (kg)</Label>
            <Input
              id="grossWeight"
              type="number"
              step="0.1"
              value={grossWeight}
              onChange={(e) => handleGrossWeightChange(e.target.value)}
              placeholder="Digite o peso bruto"
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantidade ({product.unit})</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              placeholder={`Digite a quantidade em ${product.unit}`}
            />
          </div>

          {netWeight > 0 && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="font-medium">Peso Líquido Calculado</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {netWeight.toFixed(2)} kg
              </div>
            </div>
          )}

          {divergence && (
            <div className={`p-3 border rounded-lg ${
              divergence.severity === 'high' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`h-4 w-4 ${
                  divergence.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <span className="font-medium">Divergência Detectada</span>
                <Badge className={
                  divergence.severity === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }>
                  {divergence.severity === 'high' ? 'CRÍTICA' : 'ATENÇÃO'}
                </Badge>
              </div>
              <div className="text-sm">
                <div>Tipo: {divergence.type === 'weight' ? 'Peso' : 'Quantidade'}</div>
                <div>Esperado: {divergence.expected}</div>
                <div>Atual: {divergence.actual}</div>
                <div>Diferença: {divergence.percentage.toFixed(1)}%</div>
              </div>
            </div>
          )}

          <Button 
            onClick={handleSubmit}
            disabled={!selectedContainer || !grossWeight || !quantity}
            className="w-full"
          >
            Confirmar Pesagem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

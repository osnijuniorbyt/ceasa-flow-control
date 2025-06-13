
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Target,
  BarChart3,
  RefreshCw
} from "lucide-react";

interface SimulationResult {
  newPrice: number;
  margin: number;
  revenueChange: number;
  unitsSoldChange: number;
  totalProfit: number;
  breakEvenUnits: number;
}

export function MarginSimulator() {
  const [selectedProduct, setSelectedProduct] = useState("P001");
  const [currentPrice, setCurrentPrice] = useState(4.80);
  const [cost, setCost] = useState(3.20);
  const [currentUnits, setCurrentUnits] = useState(100);
  const [priceElasticity, setPriceElasticity] = useState([0.8]);
  const [targetPrice, setTargetPrice] = useState([5.20]);
  
  const products = [
    { id: "P001", name: "Alface hidropônica", price: 4.80, cost: 3.20, units: 100 },
    { id: "P002", name: "Tomate grape", price: 7.50, cost: 4.50, units: 80 },
    { id: "P003", name: "Moranguinho", price: 14.00, cost: 8.20, units: 60 },
    { id: "P004", name: "Batata doce", price: 4.20, cost: 2.80, units: 120 }
  ];

  const calculateSimulation = (): SimulationResult => {
    const newPrice = targetPrice[0];
    const priceChangePercent = (newPrice - currentPrice) / currentPrice;
    const demandChangePercent = -priceElasticity[0] * priceChangePercent;
    const newUnits = Math.max(0, currentUnits * (1 + demandChangePercent));
    
    const margin = ((newPrice - cost) / newPrice) * 100;
    const currentRevenue = currentPrice * currentUnits;
    const newRevenue = newPrice * newUnits;
    const revenueChange = ((newRevenue - currentRevenue) / currentRevenue) * 100;
    
    const currentProfit = (currentPrice - cost) * currentUnits;
    const newProfit = (newPrice - cost) * newUnits;
    const totalProfit = newProfit - currentProfit;
    
    const breakEvenUnits = cost > 0 ? Math.ceil(currentUnits * currentPrice / newPrice) : 0;

    return {
      newPrice,
      margin,
      revenueChange,
      unitsSoldChange: ((newUnits - currentUnits) / currentUnits) * 100,
      totalProfit,
      breakEvenUnits
    };
  };

  const simulation = calculateSimulation();

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(productId);
      setCurrentPrice(product.price);
      setCost(product.cost);
      setCurrentUnits(product.units);
      setTargetPrice([product.price * 1.1]);
    }
  };

  const resetSimulation = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (product) {
      setCurrentPrice(product.price);
      setCost(product.cost);
      setCurrentUnits(product.units);
      setTargetPrice([product.price]);
      setPriceElasticity([0.8]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulador de Margem e Impacto
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Simule mudanças de preço e veja o impacto na margem, receita e volume de vendas
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product">Produto</Label>
                  <select 
                    id="product"
                    value={selectedProduct}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

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

                <Button onClick={resetSimulation} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resetar Simulação
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resultados da Simulação
              </h3>

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
                      Atual: {(((currentPrice - cost) / currentPrice) * 100).toFixed(1)}%
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

              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Resumo do Cenário</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <div>• Preço: R$ {currentPrice.toFixed(2)} → R$ {simulation.newPrice.toFixed(2)}</div>
                    <div>• Margem: {(((currentPrice - cost) / currentPrice) * 100).toFixed(1)}% → {simulation.margin.toFixed(1)}%</div>
                    <div>• Break-even: {simulation.breakEvenUnits} unidades</div>
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

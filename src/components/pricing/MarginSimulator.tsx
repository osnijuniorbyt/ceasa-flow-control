
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calculator, 
  BarChart3
} from "lucide-react";
import { ProductSelector } from "./ProductSelector";
import { SimulationControls } from "./SimulationControls";
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
                <ProductSelector
                  products={products}
                  selectedProduct={selectedProduct}
                  onProductChange={handleProductChange}
                />

                <SimulationControls
                  currentPrice={currentPrice}
                  setCurrentPrice={setCurrentPrice}
                  cost={cost}
                  setCost={setCost}
                  currentUnits={currentUnits}
                  setCurrentUnits={setCurrentUnits}
                  targetPrice={targetPrice}
                  setTargetPrice={setTargetPrice}
                  priceElasticity={priceElasticity}
                  setPriceElasticity={setPriceElasticity}
                  onReset={resetSimulation}
                />
              </div>
            </div>

            {/* Results */}
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
                currentMargin={((currentPrice - cost) / currentPrice) * 100}
                newMargin={simulation.margin}
                breakEvenUnits={simulation.breakEvenUnits}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

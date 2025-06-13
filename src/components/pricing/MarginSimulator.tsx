
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { PricingInputs } from "./PricingInputs";
import { PricingResults } from "./PricingResults";
import { calculatePricingSimulation } from "./PricingCalculator";

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

  const simulation = calculatePricingSimulation({
    currentPrice,
    cost,
    currentUnits,
    targetPrice: targetPrice[0],
    priceElasticity: priceElasticity[0]
  });

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
            <PricingInputs
              products={products}
              selectedProduct={selectedProduct}
              currentPrice={currentPrice}
              cost={cost}
              currentUnits={currentUnits}
              targetPrice={targetPrice}
              priceElasticity={priceElasticity}
              onProductChange={handleProductChange}
              setCurrentPrice={setCurrentPrice}
              setCost={setCost}
              setCurrentUnits={setCurrentUnits}
              setTargetPrice={setTargetPrice}
              setPriceElasticity={setPriceElasticity}
              onReset={resetSimulation}
            />

            <PricingResults 
              simulation={simulation}
              currentPrice={currentPrice}
              cost={cost}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

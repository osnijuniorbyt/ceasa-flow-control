
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Shield } from "lucide-react";
import { PricingInputs } from "./PricingInputs";
import { PricingResults } from "./PricingResults";
import { calculatePricingSimulation } from "./PricingCalculator";
import { validateNumber, validatePricingRule, handleSecureError, formatSecureNumber } from "@/utils/security";
import { toast } from "sonner";

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

  const handlePriceChange = (newPrice: number) => {
    try {
      if (!validateNumber(newPrice, 0.01, 9999)) {
        toast.error('Preço deve estar entre R$ 0,01 e R$ 9.999,00');
        return;
      }
      setCurrentPrice(newPrice);
    } catch (error) {
      handleSecureError(error, 'Erro ao validar preço');
    }
  };

  const handleCostChange = (newCost: number) => {
    try {
      if (!validateNumber(newCost, 0.01, 9999)) {
        toast.error('Custo deve estar entre R$ 0,01 e R$ 9.999,00');
        return;
      }
      
      // Validate business rule
      if (currentPrice > 0) {
        const validation = validatePricingRule(currentPrice, newCost);
        if (!validation.valid) {
          toast.warning(validation.message);
        }
      }
      
      setCost(newCost);
    } catch (error) {
      handleSecureError(error, 'Erro ao validar custo');
    }
  };

  const handleUnitsChange = (newUnits: number) => {
    try {
      if (!validateNumber(newUnits, 1, 999999)) {
        toast.error('Unidades devem estar entre 1 e 999.999');
        return;
      }
      setCurrentUnits(newUnits);
    } catch (error) {
      handleSecureError(error, 'Erro ao validar unidades');
    }
  };

  const handleTargetPriceChange = (newTargetPrice: number[]) => {
    try {
      const price = newTargetPrice[0];
      if (!validateNumber(price, 0.01, 9999)) {
        return; // Silently ignore invalid slider values
      }
      
      // Validate business rule
      const validation = validatePricingRule(price, cost);
      if (!validation.valid && price > 0 && cost > 0) {
        toast.warning(validation.message);
      }
      
      setTargetPrice(newTargetPrice);
    } catch (error) {
      handleSecureError(error, 'Erro ao validar preço alvo');
    }
  };

  const handleElasticityChange = (newElasticity: number[]) => {
    try {
      const elasticity = newElasticity[0];
      if (!validateNumber(elasticity, 0.1, 5)) {
        return; // Silently ignore invalid slider values
      }
      setPriceElasticity(newElasticity);
    } catch (error) {
      handleSecureError(error, 'Erro ao validar elasticidade');
    }
  };

  // Safe simulation calculation with error handling
  let simulation;
  try {
    simulation = calculatePricingSimulation({
      currentPrice,
      cost,
      currentUnits,
      targetPrice: targetPrice[0],
      priceElasticity: priceElasticity[0]
    });
  } catch (error) {
    handleSecureError(error, 'Erro no cálculo da simulação');
    simulation = {
      newPrice: 0,
      margin: 0,
      revenueChange: 0,
      unitsSoldChange: 0,
      totalProfit: 0,
      breakEvenUnits: 0
    };
  }

  const handleProductChange = (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (product) {
        setSelectedProduct(productId);
        setCurrentPrice(product.price);
        setCost(product.cost);
        setCurrentUnits(product.units);
        setTargetPrice([product.price * 1.1]);
      }
    } catch (error) {
      handleSecureError(error, 'Erro ao selecionar produto');
    }
  };

  const resetSimulation = () => {
    try {
      const product = products.find(p => p.id === selectedProduct);
      if (product) {
        setCurrentPrice(product.price);
        setCost(product.cost);
        setCurrentUnits(product.units);
        setTargetPrice([product.price]);
        setPriceElasticity([0.8]);
        toast.success('Simulação resetada');
      }
    } catch (error) {
      handleSecureError(error, 'Erro ao resetar simulação');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulador de Margem e Impacto
            <Shield className="h-4 w-4 text-green-600" title="Sistema Seguro" />
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Simule mudanças de preço com validação de segurança integrada
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
              setCurrentPrice={handlePriceChange}
              setCost={handleCostChange}
              setCurrentUnits={handleUnitsChange}
              setTargetPrice={handleTargetPriceChange}
              setPriceElasticity={handleElasticityChange}
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


import { ProductSelector } from "./ProductSelector";
import { SimulationControls } from "./SimulationControls";

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  units: number;
}

interface PricingInputsProps {
  products: Product[];
  selectedProduct: string;
  currentPrice: number;
  cost: number;
  currentUnits: number;
  targetPrice: number[];
  priceElasticity: number[];
  onProductChange: (productId: string) => void;
  setCurrentPrice: (price: number) => void;
  setCost: (cost: number) => void;
  setCurrentUnits: (units: number) => void;
  setTargetPrice: (price: number[]) => void;
  setPriceElasticity: (elasticity: number[]) => void;
  onReset: () => void;
}

export function PricingInputs({
  products,
  selectedProduct,
  currentPrice,
  cost,
  currentUnits,
  targetPrice,
  priceElasticity,
  onProductChange,
  setCurrentPrice,
  setCost,
  setCurrentUnits,
  setTargetPrice,
  setPriceElasticity,
  onReset
}: PricingInputsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <ProductSelector
          products={products}
          selectedProduct={selectedProduct}
          onProductChange={onProductChange}
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
          onReset={onReset}
        />
      </div>
    </div>
  );
}

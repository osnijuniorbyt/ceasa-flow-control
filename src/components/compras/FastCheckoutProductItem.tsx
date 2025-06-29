
import { useCart } from "@/contexts/CartContext";
import { ProductHeader } from "./ProductHeader";
import { ProductInfo } from "./ProductInfo";
import { ProductBadges } from "./ProductBadges";
import { ProductInputs } from "./ProductInputs";
import { ProductTotal } from "./ProductTotal";
import { ProductCartControls } from "./ProductCartControls";

interface FastCheckoutProduct {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  originalStock: number;
  unit: string;
  stockLevel: "critical" | "low" | "medium" | "good";
  suggestedQuantity: number;
  targetQuantity: number;
  lastSupplier: string;
  lastPrice: number;
  unitPrice: number;
  supplierRating: "excellent" | "good" | "warning" | "poor";
  supplierNote: string;
  dailySales: number;
  isSelected: boolean;
  paymentMethod: "BOLETO" | "NOTA FISCAL";
  daysToPayment: number;
}

interface FastCheckoutProductItemProps {
  product: FastCheckoutProduct;
  onToggle: (productId: string) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onPriceChange: (productId: string, price: number) => void;
  onKeyPress: (e: React.KeyboardEvent, productId: string) => void;
}

export function FastCheckoutProductItem({
  product,
  onToggle,
  onQuantityChange,
  onPriceChange,
  onKeyPress
}: FastCheckoutProductItemProps) {
  const { addItem } = useCart();

  const handleAddToCart = (cartQuantity: number) => {
    addItem(product, cartQuantity);
  };

  const handleTargetQuantityChange = (newQuantity: number) => {
    onQuantityChange(product.id, newQuantity);
  };

  const handleUnitPriceChange = (newPrice: number) => {
    onPriceChange(product.id, newPrice);
  };

  return (
    <div
      className={`p-4 border-2 rounded-lg transition-all ${
        product.isSelected 
          ? 'border-primary bg-primary/5 shadow-sm' 
          : 'border-border hover:border-primary/50'
      }`}
    >
      {/* Mobile Layout */}
      <div className="space-y-4">
        {/* Header Row */}
        <div className="flex items-start gap-3">
          <ProductHeader
            isSelected={product.isSelected}
            stockLevel={product.stockLevel}
            name={product.name}
            onToggle={() => onToggle(product.id)}
          />
          
          <div className="flex-1 min-w-0">
            <ProductInfo
              currentStock={product.currentStock}
              unit={product.unit}
              dailySales={product.dailySales}
            />

            <ProductBadges
              lastSupplier={product.lastSupplier}
              paymentMethod={product.paymentMethod}
            />
          </div>
        </div>

        {/* Price and Quantity Row */}
        <ProductInputs
          targetQuantity={product.targetQuantity}
          unitPrice={product.unitPrice}
          unit={product.unit}
          onQuantityChange={handleTargetQuantityChange}
          onPriceChange={handleUnitPriceChange}
        />

        {/* Total and Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <ProductTotal
            targetQuantity={product.targetQuantity}
            unitPrice={product.unitPrice}
            daysToPayment={product.daysToPayment}
          />

          <ProductCartControls
            unitPrice={product.unitPrice}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </div>
  );
}

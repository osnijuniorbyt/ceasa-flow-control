
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/mobile/NumberInput";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

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
  const [orderQuantity, setOrderQuantity] = useState(1);

  const getStockIndicator = (level: string) => {
    switch (level) {
      case "critical": return "🔴";
      case "low": return "🟡";
      default: return "🟢";
    }
  };

  const handleAddToCart = () => {
    addItem(product, orderQuantity);
    setOrderQuantity(1);
  };

  const handleQuantityIncrement = () => {
    setOrderQuantity(prev => Math.min(prev + 1, 999));
  };

  const handleQuantityDecrement = () => {
    setOrderQuantity(prev => Math.max(prev - 1, 1));
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
          <Checkbox
            checked={product.isSelected}
            onCheckedChange={() => onToggle(product.id)}
            className="h-5 w-5 mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{getStockIndicator(product.stockLevel)}</span>
              <h4 className="font-semibold text-base leading-tight">{product.name}</h4>
            </div>
            
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
              <span>Estoque: {product.currentStock}{product.unit}</span>
              <span>•</span>
              <span>Vende: {product.dailySales}{product.unit}/dia</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {product.lastSupplier}
              </Badge>
              <Badge className={`text-xs ${
                product.paymentMethod === "BOLETO" 
                  ? "bg-blue-100 text-blue-800" 
                  : "bg-green-100 text-green-800"
              }`}>
                {product.paymentMethod}
              </Badge>
            </div>
          </div>
        </div>

        {/* Price and Quantity Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Quantidade</label>
            <NumberInput
              value={product.targetQuantity}
              onChange={(value) => onQuantityChange(product.id, value)}
              className="w-full h-12"
              min={0}
              max={999}
              allowDecimal={false}
            />
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Preço/{product.unit}</label>
            <NumberInput
              value={product.unitPrice}
              onChange={(value) => onPriceChange(product.id, value)}
              className="w-full h-12"
              min={0}
              max={9999}
              allowDecimal={true}
            />
          </div>
        </div>

        {/* Total and Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <div className="text-lg font-bold text-primary">
              R$ {(product.targetQuantity * product.unitPrice).toLocaleString('pt-BR', { 
                minimumFractionDigits: 2 
              })}
            </div>
            <div className="text-xs text-muted-foreground">
              Venc: {product.daysToPayment} dias
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuantityDecrement();
                }}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-semibold w-8 text-center">
                {orderQuantity}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuantityIncrement();
                }}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              size="sm"
              className="h-10"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              R$ {(orderQuantity * product.unitPrice).toLocaleString('pt-BR', { 
                minimumFractionDigits: 2 
              })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

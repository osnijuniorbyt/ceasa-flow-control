
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  const getStockIndicator = (level: string) => {
    switch (level) {
      case "critical": return "🔴";
      case "low": return "🟡";
      default: return "🟢";
    }
  };

  return (
    <div
      className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
        product.isSelected 
          ? 'border-primary bg-primary/5 shadow-sm' 
          : 'border-border hover:border-primary/50'
      }`}
      onClick={() => onToggle(product.id)}
      onKeyDown={(e) => onKeyPress(e, product.id)}
      tabIndex={0}
    >
      <div className="flex items-center gap-4">
        <Checkbox
          checked={product.isSelected}
          onCheckedChange={() => onToggle(product.id)}
          className="h-6 w-6"
        />
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
          {/* Product Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getStockIndicator(product.stockLevel)}</span>
              <h4 className="font-semibold">{product.name}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Estoque: {product.currentStock}{product.unit} | Vende: {product.dailySales}{product.unit}/dia
            </p>
          </div>
          
          {/* Quantity */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {product.originalStock}{product.unit} →
            </span>
            <Input
              type="number"
              value={product.targetQuantity}
              onChange={(e) => onQuantityChange(product.id, parseInt(e.target.value) || 0)}
              className="w-20 h-10 text-center font-semibold"
              min="0"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm">{product.unit}</span>
          </div>
          
          {/* Supplier */}
          <div>
            <Badge variant="secondary" className="font-medium">
              {product.lastSupplier}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {product.supplierNote}
            </p>
          </div>
          
          {/* Price */}
          <div className="flex items-center gap-1">
            <span className="text-sm">R$</span>
            <Input
              type="number"
              value={product.unitPrice.toFixed(2)}
              onChange={(e) => onPriceChange(product.id, parseFloat(e.target.value) || 0)}
              className="w-24 h-10 text-center font-semibold"
              step="0.01"
              min="0"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm">/{product.unit}</span>
          </div>
          
          {/* Payment Method & Total */}
          <div className="text-right">
            <Badge className={`${
              product.paymentMethod === "BOLETO" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-green-100 text-green-800"
            }`}>
              {product.paymentMethod}
            </Badge>
            <p className="font-bold text-lg mt-1">
              R$ {(product.targetQuantity * product.unitPrice).toLocaleString('pt-BR', { 
                minimumFractionDigits: 2 
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              Venc: {product.daysToPayment} dias
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

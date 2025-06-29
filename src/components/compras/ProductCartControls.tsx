
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart } from "lucide-react";

interface ProductCartControlsProps {
  unitPrice: number;
  onAddToCart: (quantity: number) => void;
}

export function ProductCartControls({ unitPrice, onAddToCart }: ProductCartControlsProps) {
  const [cartQuantity, setCartQuantity] = useState(1);

  const handleCartQuantityIncrement = () => {
    setCartQuantity(prev => Math.min(prev + 1, 999));
  };

  const handleCartQuantityDecrement = () => {
    setCartQuantity(prev => Math.max(prev - 1, 1));
  };

  const handleAddToCart = () => {
    onAddToCart(cartQuantity);
    setCartQuantity(1);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleCartQuantityDecrement();
          }}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="text-sm font-semibold w-8 text-center">
          {cartQuantity}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleCartQuantityIncrement();
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
        R$ {(cartQuantity * unitPrice).toLocaleString('pt-BR', { 
          minimumFractionDigits: 2 
        })}
      </Button>
    </div>
  );
}

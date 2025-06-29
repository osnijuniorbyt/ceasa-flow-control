
import { NumberInput } from "@/components/mobile/NumberInput";

interface ProductInputsProps {
  targetQuantity: number;
  unitPrice: number;
  unit: string;
  onQuantityChange: (quantity: number) => void;
  onPriceChange: (price: number) => void;
}

export function ProductInputs({ 
  targetQuantity, 
  unitPrice, 
  unit, 
  onQuantityChange, 
  onPriceChange 
}: ProductInputsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Quantidade</label>
        <NumberInput
          value={targetQuantity}
          onChange={onQuantityChange}
          className="w-full h-12"
          min={0}
          max={999}
          allowDecimal={false}
        />
      </div>
      
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Preço/{unit}</label>
        <NumberInput
          value={unitPrice}
          onChange={onPriceChange}
          className="w-full h-12"
          min={0}
          max={9999}
          allowDecimal={true}
        />
      </div>
    </div>
  );
}

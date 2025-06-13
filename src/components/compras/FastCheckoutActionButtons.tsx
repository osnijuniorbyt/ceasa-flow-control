
import { Button } from "@/components/ui/button";
import { ShoppingCart, X } from "lucide-react";

interface FastCheckoutActionButtonsProps {
  selectedCount: number;
  onConfirm: () => void;
  onClear: () => void;
}

export function FastCheckoutActionButtons({
  selectedCount,
  onConfirm,
  onClear
}: FastCheckoutActionButtonsProps) {
  return (
    <div className="flex gap-4 pt-4 border-t">
      <Button
        onClick={onConfirm}
        disabled={selectedCount === 0}
        className="flex-1 h-14 text-lg font-semibold"
        size="lg"
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        Confirmar Pedidos Selecionados ({selectedCount})
      </Button>
      
      <Button
        variant="outline"
        onClick={onClear}
        className="h-14 px-8"
      >
        <X className="h-4 w-4 mr-2" />
        Limpar
      </Button>
    </div>
  );
}

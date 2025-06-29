
import { Badge } from "@/components/ui/badge";

interface ProductBadgesProps {
  lastSupplier: string;
  paymentMethod: "BOLETO" | "NOTA FISCAL";
}

export function ProductBadges({ lastSupplier, paymentMethod }: ProductBadgesProps) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Badge variant="secondary" className="text-xs">
        {lastSupplier}
      </Badge>
      <Badge className={`text-xs ${
        paymentMethod === "BOLETO" 
          ? "bg-blue-100 text-blue-800" 
          : "bg-green-100 text-green-800"
      }`}>
        {paymentMethod}
      </Badge>
    </div>
  );
}

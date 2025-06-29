
import { Checkbox } from "@/components/ui/checkbox";

interface ProductHeaderProps {
  isSelected: boolean;
  stockLevel: "critical" | "low" | "medium" | "good";
  name: string;
  onToggle: () => void;
}

const getStockIndicator = (level: string) => {
  switch (level) {
    case "critical": return "🔴";
    case "low": return "🟡";
    default: return "🟢";
  }
};

export function ProductHeader({ isSelected, stockLevel, name, onToggle }: ProductHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        className="h-5 w-5 mt-1"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">{getStockIndicator(stockLevel)}</span>
          <h4 className="font-semibold text-base leading-tight">{name}</h4>
        </div>
      </div>
    </div>
  );
}


import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface PriceItem {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  suggestedPrice: number;
  lastUpdated: string;
  margin: number;
  perishability: number;
  marketTrend: "up" | "down" | "stable";
  status: "normal" | "critical" | "opportunity";
}

interface PricingTableRowProps {
  item: PriceItem;
  onUpdatePrice: (id: string, newPrice: number) => void;
  onApplySuggestedPrice: (id: string) => void;
}

export function PricingTableRow({ 
  item, 
  onUpdatePrice, 
  onApplySuggestedPrice 
}: PricingTableRowProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Crítico</Badge>;
      case "opportunity":
        return <Badge className="bg-green-100 text-green-800">Oportunidade</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Normal</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-xs text-muted-foreground">{item.category}</div>
        </div>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={item.currentPrice}
          onChange={(e) => onUpdatePrice(item.id, parseFloat(e.target.value) || 0)}
          className="w-20"
          step="0.01"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-medium">R$ {item.suggestedPrice.toFixed(2)}</span>
          {Math.abs(item.currentPrice - item.suggestedPrice) > 0.1 && (
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className={`font-medium ${
          item.margin >= 40 ? 'text-green-600' : 
          item.margin >= 30 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {item.margin}%
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {getTrendIcon(item.marketTrend)}
          <span className="text-sm capitalize">
            {item.marketTrend === "stable" ? "Estável" : item.marketTrend === "up" ? "Alta" : "Baixa"}
          </span>
        </div>
      </TableCell>
      <TableCell>{getStatusBadge(item.status)}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onApplySuggestedPrice(item.id)}
            disabled={Math.abs(item.currentPrice - item.suggestedPrice) < 0.01}
          >
            Aplicar
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

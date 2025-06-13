
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { BulkUpdateItem } from "./BulkUpdateTypes";

interface ItemPreviewProps {
  filteredItems: BulkUpdateItem[];
  selectedCount: number;
  onToggleItemSelection: (id: string) => void;
  onSelectAllItems: () => void;
  onDeselectAllItems: () => void;
}

export function ItemPreview({
  filteredItems,
  selectedCount,
  onToggleItemSelection,
  onSelectAllItems,
  onDeselectAllItems
}: ItemPreviewProps) {
  const getValidationBadge = (validation: string, message?: string) => {
    switch (validation) {
      case "error":
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800">OK</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Pré-visualização ({selectedCount} selecionados)</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSelectAllItems}>
            Selecionar Todos
          </Button>
          <Button variant="outline" size="sm" onClick={onDeselectAllItems}>
            Desmarcar Todos
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="max-h-96 overflow-y-auto">
          {filteredItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 border-b last:border-b-0">
              <Checkbox
                checked={item.selected}
                onCheckedChange={() => onToggleItemSelection(item.id)}
              />
              
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">{item.category}</div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm">R$ {item.currentPrice.toFixed(2)}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">R$ {item.newPrice.toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getValidationBadge(item.validation, item.message)}
                {item.validation === "valid" && <CheckCircle className="h-4 w-4 text-green-600" />}
                {item.validation !== "valid" && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

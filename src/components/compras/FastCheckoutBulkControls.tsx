
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface FastCheckoutBulkControlsProps {
  allSelected: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
}

export function FastCheckoutBulkControls({ 
  allSelected, 
  selectedCount, 
  totalCount, 
  onSelectAll 
}: FastCheckoutBulkControlsProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onSelectAll}
        />
        <label className="text-sm font-medium">
          Selecionar Todos ({totalCount} produtos)
        </label>
      </div>
      <Badge variant="outline">
        {selectedCount} de {totalCount} selecionados
      </Badge>
    </div>
  );
}

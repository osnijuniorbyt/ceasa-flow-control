
import { BulkUpdateItem } from "./BulkUpdateTypes";

interface ValidationSummaryProps {
  filteredItems: BulkUpdateItem[];
  selectedCount: number;
  totalImpact: number;
}

export function ValidationSummary({
  filteredItems,
  selectedCount,
  totalImpact
}: ValidationSummaryProps) {
  const alertCount = filteredItems.filter(i => i.selected && i.validation !== "valid").length;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-800 mb-2">Resumo da Atualização</h4>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-blue-600 font-medium">{selectedCount}</div>
          <div className="text-blue-700">Produtos selecionados</div>
        </div>
        <div>
          <div className="text-blue-600 font-medium">
            {totalImpact >= 0 ? '+' : ''}R$ {totalImpact.toFixed(2)}
          </div>
          <div className="text-blue-700">Impacto total</div>
        </div>
        <div>
          <div className="text-blue-600 font-medium">{alertCount}</div>
          <div className="text-blue-700">Com alertas</div>
        </div>
      </div>
    </div>
  );
}

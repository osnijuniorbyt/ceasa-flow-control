
import { Button } from "@/components/ui/button";

interface BulkControlsProps {
  selectedCount: number;
}

export function BulkControls({ selectedCount }: BulkControlsProps) {
  return (
    <div className="flex gap-2">
      <Button 
        className="flex-1"
        disabled={selectedCount === 0}
      >
        Confirmar Atualizações ({selectedCount})
      </Button>
      <Button variant="outline">
        Salvar Rascunho
      </Button>
    </div>
  );
}

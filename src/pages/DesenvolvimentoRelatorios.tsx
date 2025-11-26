import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ComparativoLotes } from "@/components/compras-ceasa/ComparativoLotes";

export default function DesenvolvimentoRelatorios() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-black text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/desenvolvimento")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <h1 className="text-xl font-light tracking-wide">RELATÓRIOS</h1>
        </div>
      </div>

      <div className="p-4">
        <ComparativoLotes />
      </div>
    </div>
  );
}

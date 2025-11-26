import { useState, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SwipeableHistoricoItemProps {
  produto: any;
  fornecedorId: string;
  onSelect: (produto: any) => void;
}

export function SwipeableHistoricoItem({ produto, fornecedorId, onSelect }: SwipeableHistoricoItemProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const queryClient = useQueryClient();

  const deletarMutation = useMutation({
    mutationFn: async () => {
      // Deletar todos os itens de compra deste produto com este fornecedor
      const { error } = await supabase
        .from("itens_compra")
        .delete()
        .eq("produto_id", produto.id)
        .in("compra_id", (
          await supabase
            .from("compras")
            .select("id")
            .eq("fornecedor_id", fornecedorId)
        ).data?.map(c => c.id) || []);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Histórico removido");
      queryClient.invalidateQueries({ queryKey: ["produtos-fornecedor-historico", fornecedorId] });
    },
    onError: () => {
      toast.error("Erro ao remover histórico");
      setTranslateX(0);
    },
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = translateX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX.current;
    const newTranslateX = currentX.current + deltaX;
    
    // Só permite arrastar para a esquerda
    if (newTranslateX < 0) {
      setTranslateX(Math.max(newTranslateX, -100));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Se arrastou mais de 50px, mostra o botão de deletar
    if (translateX < -50) {
      setTranslateX(-80);
    } else {
      setTranslateX(0);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deletarMutation.mutate();
  };

  const handleClick = () => {
    if (translateX === 0) {
      onSelect(produto);
    } else {
      setTranslateX(0);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Botão de deletar atrás */}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-destructive flex items-center justify-center">
        <button
          onClick={handleDelete}
          disabled={deletarMutation.isPending}
          className="h-full w-full flex items-center justify-center"
        >
          <Trash2 className="h-6 w-6 text-destructive-foreground" />
        </button>
      </div>

      {/* Item principal */}
      <button
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
        className="w-full p-3 border-2 rounded-lg hover:bg-muted/50 bg-background text-left relative min-h-[70px]"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base truncate">
              {produto.codigo} - {produto.descricao}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <span className="font-medium">{produto.vezes_comprado}x comprado</span>
              <span>•</span>
              <span className="text-green-600 font-bold text-lg">
                R$ {Number(produto.ultimo_valor).toFixed(2)}
              </span>
            </div>
          </div>
          {translateX === 0 && (
            <Plus className="h-6 w-6 text-primary flex-shrink-0 ml-3" />
          )}
        </div>
      </button>
    </div>
  );
}

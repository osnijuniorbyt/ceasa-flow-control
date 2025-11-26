import { useState, useRef } from "react";
import { Trash2 } from "lucide-react";

interface ItemCarrinho {
  produto_id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: string;
  valor_total: string;
}

interface SwipeableCarrinhoItemProps {
  item: ItemCarrinho;
  index: number;
  onRemove: (index: number) => void;
}

export function SwipeableCarrinhoItem({ item, index, onRemove }: SwipeableCarrinhoItemProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

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
    
    // Se arrastou mais de 50px, remove o item
    if (translateX < -50) {
      onRemove(index);
    } else {
      setTranslateX(0);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(index);
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Botão de deletar atrás */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-destructive flex items-center justify-center">
        <button
          onClick={handleDelete}
          className="h-full w-full flex items-center justify-center"
        >
          <Trash2 className="h-5 w-5 text-destructive-foreground" />
        </button>
      </div>

      {/* Item principal */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
        className="bg-muted/50 p-2 rounded-lg flex items-center justify-between relative"
      >
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">
            {item.codigo} - {item.descricao}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {item.quantidade} {item.unidade} • <span className="text-green-600 font-bold text-base">R$ {parseFloat(item.valor_total).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

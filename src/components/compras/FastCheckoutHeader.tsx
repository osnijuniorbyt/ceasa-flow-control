
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

interface FastCheckoutHeaderProps {
  totalValue: number;
  totalItems: number;
}

export function FastCheckoutHeader({ totalValue, totalItems }: FastCheckoutHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Zap className="h-6 w-6 text-orange-500" />
            Checkout Rápido - Compras Diárias
          </CardTitle>
          <p className="text-muted-foreground">
            Interface otimizada para pedidos rápidos com controle de pagamentos integrado
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Selecionado</p>
          <p className="text-2xl font-bold text-primary">
            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-muted-foreground">{totalItems} itens</p>
        </div>
      </div>
    </CardHeader>
  );
}

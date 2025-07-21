import { Card } from "@/components/ui/card";

interface FastCheckoutSummaryHeaderProps {
  totalValue: number;
  totalItems: number;
}

export function FastCheckoutSummaryHeader({ totalValue, totalItems }: FastCheckoutSummaryHeaderProps) {
  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold flex items-center gap-2">
            ⚡ Checkout Rápido
          </h2>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground">{totalItems} itens</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Interface otimizada para pedidos rápidos
        </p>
      </div>
    </Card>
  );
}
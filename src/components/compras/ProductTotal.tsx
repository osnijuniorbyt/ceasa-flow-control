
interface ProductTotalProps {
  targetQuantity: number;
  unitPrice: number;
  daysToPayment: number;
}

export function ProductTotal({ targetQuantity, unitPrice, daysToPayment }: ProductTotalProps) {
  return (
    <div>
      <div className="text-lg font-bold text-primary">
        R$ {(targetQuantity * unitPrice).toLocaleString('pt-BR', { 
          minimumFractionDigits: 2 
        })}
      </div>
      <div className="text-xs text-muted-foreground">
        Venc: {daysToPayment} dias
      </div>
    </div>
  );
}

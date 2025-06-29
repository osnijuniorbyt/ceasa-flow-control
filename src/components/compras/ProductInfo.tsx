
interface ProductInfoProps {
  currentStock: number;
  unit: string;
  dailySales: number;
}

export function ProductInfo({ currentStock, unit, dailySales }: ProductInfoProps) {
  return (
    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
      <span>Estoque: {currentStock}{unit}</span>
      <span>•</span>
      <span>Vende: {dailySales}{unit}/dia</span>
    </div>
  );
}


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/inventory";
import { getStockStatus } from "@/utils/inventoryUtils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const stockStatus = getStockStatus(product.quantity, product.minStock);

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-semibold">{product.name}</h4>
          <Badge className={stockStatus.color}>
            {stockStatus.label}
          </Badge>
          <Badge variant="outline">
            {product.category}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p><strong>Quantidade:</strong> {product.quantity} {product.unit}</p>
            <p><strong>Estoque Mín:</strong> {product.minStock} {product.unit}</p>
          </div>
          <div>
            <p><strong>Fornecedor:</strong> {product.supplier}</p>
            <p><strong>Localização:</strong> {product.location}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          <strong>Validade:</strong> {product.expiryDate}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          Editar
        </Button>
        <Button size="sm">
          Movimentar
        </Button>
      </div>
    </div>
  );
}

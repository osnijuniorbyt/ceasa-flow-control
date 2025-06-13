
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle } from "lucide-react";
import { Product } from "@/types/product";
import { 
  calculateTotalValue, 
  getCriticalProductsCount, 
  getLowStockProductsCount 
} from "@/utils/productUtils";

interface ProductStatsCardsProps {
  products: Product[];
}

export default function ProductStatsCards({ products }: ProductStatsCardsProps) {
  const totalValue = calculateTotalValue(products);
  const criticalProducts = getCriticalProductsCount(products);
  const lowStockProducts = getLowStockProductsCount(products);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{products.length}</div>
          <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-muted-foreground">Em estoque</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estoque Crítico</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{criticalProducts}</div>
          <p className="text-xs text-muted-foreground">Produtos em falta</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{lowStockProducts}</div>
          <p className="text-xs text-muted-foreground">Necessita reposição</p>
        </CardContent>
      </Card>
    </div>
  );
}

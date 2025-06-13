
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { Product } from "@/types/product";
import { getStatusBadge, getStockIcon } from "@/utils/productUtils";

interface ProductTableProps {
  products: Product[];
}

export default function ProductTable({ products }: ProductTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produto</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Estoque</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Preço/Unidade</TableHead>
          <TableHead>Fornecedor</TableHead>
          <TableHead>Localização</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {getStockIcon(product.currentStock, product.minStock, product.maxStock)}
                {product.name}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{product.category}</Badge>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{product.currentStock} {product.unit}</div>
                <div className="text-xs text-muted-foreground">
                  Min: {product.minStock} | Max: {product.maxStock}
                </div>
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(product.status)}</TableCell>
            <TableCell>R$ {product.pricePerUnit.toFixed(2)}</TableCell>
            <TableCell className="text-sm">{product.supplier}</TableCell>
            <TableCell>{product.location}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

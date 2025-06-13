
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Truck } from "lucide-react";
import { ProductReceiving } from "@/types/receiving";

interface ProductSelectionProps {
  products: ProductReceiving[];
  selectedProduct: ProductReceiving | null;
  onProductSelect: (product: ProductReceiving) => void;
}

export function ProductSelection({ products, selectedProduct, onProductSelect }: ProductSelectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Produtos para Recebimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedProduct?.id === product.id 
                  ? "border-primary bg-primary/5" 
                  : "hover:bg-muted/50"
              }`}
              onClick={() => onProductSelect(product)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium">{product.name}</h4>
                </div>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Fornecedor: {product.supplier}</div>
                <div>Quantidade esperada: {product.expectedQuantity} {product.unit}</div>
                {product.expectedWeight && (
                  <div>Peso esperado: {product.expectedWeight} kg</div>
                )}
              </div>
              
              {selectedProduct?.id === product.id && (
                <div className="mt-2">
                  <Badge className="bg-primary text-primary-foreground">
                    Selecionado para pesagem
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

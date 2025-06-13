
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Star, AlertCircle, CheckCircle, Clock, Edit } from "lucide-react";
import { PurchaseProduct } from "@/types/compras";

interface AutoSuggestedListProps {
  searchTerm: string;
  selectedProducts: string[];
  onSelectionChange: (selected: string[]) => void;
}

export function AutoSuggestedList({ 
  searchTerm, 
  selectedProducts, 
  onSelectionChange 
}: AutoSuggestedListProps) {
  const [products] = useState<PurchaseProduct[]>([
    {
      id: "P001",
      name: "Alface hidropônica",
      category: "Verduras",
      currentStock: 2,
      unit: "cx",
      stockLevel: "critical",
      suggestedQuantity: 10,
      lastSupplier: "D22 rua",
      lastPrice: 18.00,
      supplierRating: "good",
      supplierNote: "Qualidade OK",
      dailySales: 8,
      isSelected: true
    },
    {
      id: "P002",
      name: "Moranguinho",
      category: "Frutas",
      currentStock: 1,
      unit: "cx",
      stockLevel: "critical",
      suggestedQuantity: 6,
      lastSupplier: "E10",
      lastPrice: 45.00,
      supplierRating: "excellent",
      supplierNote: "Sempre pontual",
      dailySales: 4,
      isSelected: true
    },
    {
      id: "P003",
      name: "Tomate grape",
      category: "Legumes",
      currentStock: 3,
      unit: "cx",
      stockLevel: "low",
      suggestedQuantity: 8,
      lastSupplier: "F59",
      lastPrice: 25.00,
      supplierRating: "warning",
      supplierNote: "Último lote 20% ruim",
      dailySales: 6,
      isSelected: false
    },
    {
      id: "P004",
      name: "Batata doce branca",
      category: "Tubérculos",
      currentStock: 5,
      unit: "cx",
      stockLevel: "good",
      suggestedQuantity: 0,
      lastSupplier: "E104",
      lastPrice: 12.00,
      supplierRating: "excellent",
      supplierNote: "Estoque OK",
      dailySales: 2,
      isSelected: false
    },
    {
      id: "P005",
      name: "Berinjela",
      category: "Legumes",
      currentStock: 1,
      unit: "cx",
      stockLevel: "critical",
      suggestedQuantity: 5,
      lastSupplier: "F100",
      lastPrice: 22.00,
      supplierRating: "good",
      supplierNote: "Produto de qualidade",
      dailySales: 3,
      isSelected: true
    }
  ]);

  const getStockColor = (level: string) => {
    switch (level) {
      case "critical": return "🔴";
      case "low": return "🟡";
      case "medium": return "🟠";
      case "good": return "🟢";
      default: return "⚪";
    }
  };

  const getSupplierIcon = (rating: string) => {
    switch (rating) {
      case "excellent": return "⭐";
      case "good": return "✅";
      case "warning": return "⚠️";
      case "poor": return "❌";
      default: return "ℹ️";
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (productId: string, isSelected: boolean) => {
    if (isSelected) {
      onSelectionChange([...selectedProducts, productId]);
    } else {
      onSelectionChange(selectedProducts.filter(id => id !== productId));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Lista de Compras Sugerida
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Produtos que precisam de reposição baseado no histórico de vendas
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`p-4 border rounded-lg transition-colors ${
                selectedProducts.includes(product.id) 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={(checked) => 
                    handleProductSelect(product.id, checked as boolean)
                  }
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{product.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Estoque:</span>
                      <span className="flex items-center gap-1">
                        {product.currentStock}{product.unit}
                        <span className="text-lg">{getStockColor(product.stockLevel)}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Sugerir:</span>
                      <Input
                        type="number"
                        value={product.suggestedQuantity}
                        className="w-20 h-8 text-sm"
                        min="0"
                      />
                      <span>{product.unit}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Fornecedor:</span>
                      <Badge variant="secondary" className="text-xs">
                        {product.lastSupplier}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Preço:</span>
                      <Input
                        type="text"
                        value={`R$ ${product.lastPrice.toFixed(2)}`}
                        className="w-24 h-8 text-sm"
                      />
                      <span>/{product.unit}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{getSupplierIcon(product.supplierRating)}</span>
                    <span>{product.supplierNote}</span>
                    <span className="ml-auto">
                      Vendas diárias: {product.dailySales}{product.unit}
                    </span>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

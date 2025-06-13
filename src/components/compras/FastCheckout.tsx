
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Zap, Check, X } from "lucide-react";
import { PurchaseProduct } from "@/types/compras";
import { toast } from "sonner";

interface FastCheckoutProduct extends PurchaseProduct {
  originalStock: number;
  targetQuantity: number;
  unitPrice: number;
  paymentMethod: "BOLETO" | "NOTA FISCAL";
  daysToPayment: number;
}

export function FastCheckout() {
  const [products, setProducts] = useState<FastCheckoutProduct[]>([
    {
      id: "P001",
      name: "Alface hidropônica",
      category: "Verduras",
      currentStock: 2,
      originalStock: 2,
      unit: "cx",
      stockLevel: "critical",
      suggestedQuantity: 10,
      targetQuantity: 10,
      lastSupplier: "D22 rua",
      lastPrice: 18.00,
      unitPrice: 18.00,
      supplierRating: "good",
      supplierNote: "Sempre pontual",
      dailySales: 8,
      isSelected: true,
      paymentMethod: "NOTA FISCAL",
      daysToPayment: 14
    },
    {
      id: "P002",
      name: "Moranguinho",
      category: "Frutas",
      currentStock: 1,
      originalStock: 1,
      unit: "cx",
      stockLevel: "critical",
      suggestedQuantity: 6,
      targetQuantity: 6,
      lastSupplier: "E10",
      lastPrice: 45.00,
      unitPrice: 45.00,
      supplierRating: "excellent",
      supplierNote: "Melhor qualidade",
      dailySales: 4,
      isSelected: true,
      paymentMethod: "BOLETO",
      daysToPayment: 7
    },
    {
      id: "P003",
      name: "Tomate grape",
      category: "Legumes",
      currentStock: 3,
      originalStock: 3,
      unit: "cx",
      stockLevel: "low",
      suggestedQuantity: 8,
      targetQuantity: 8,
      lastSupplier: "F59",
      lastPrice: 25.00,
      unitPrice: 25.00,
      supplierRating: "warning",
      supplierNote: "Qualidade variável",
      dailySales: 6,
      isSelected: false,
      paymentMethod: "BOLETO",
      daysToPayment: 10
    },
    {
      id: "P004",
      name: "Berinjela",
      category: "Legumes",
      currentStock: 1,
      originalStock: 1,
      unit: "cx",
      stockLevel: "critical",
      suggestedQuantity: 5,
      targetQuantity: 5,
      lastSupplier: "F100",
      lastPrice: 22.00,
      unitPrice: 22.00,
      supplierRating: "good",
      supplierNote: "Boa qualidade",
      dailySales: 3,
      isSelected: true,
      paymentMethod: "BOLETO",
      daysToPayment: 7
    }
  ]);

  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    const selectedCount = products.filter(p => p.isSelected).length;
    setAllSelected(selectedCount === products.length);
  }, [products]);

  const handleProductToggle = (productId: string) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, isSelected: !product.isSelected }
        : product
    ));
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, targetQuantity: newQuantity }
        : product
    ));
  };

  const handlePriceChange = (productId: string, newPrice: number) => {
    if (newPrice < 0) return;
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, unitPrice: newPrice }
        : product
    ));
  };

  const handleSelectAll = () => {
    const newSelectState = !allSelected;
    setProducts(products.map(product => ({ ...product, isSelected: newSelectState })));
    setAllSelected(newSelectState);
  };

  const handleKeyPress = (e: React.KeyboardEvent, productId: string) => {
    if (e.key === ' ') {
      e.preventDefault();
      handleProductToggle(productId);
    }
  };

  const selectedProducts = products.filter(p => p.isSelected);
  const totalValue = selectedProducts.reduce((sum, product) => 
    sum + (product.targetQuantity * product.unitPrice), 0
  );
  const totalItems = selectedProducts.reduce((sum, product) => 
    sum + product.targetQuantity, 0
  );

  const handleConfirmOrders = () => {
    if (selectedProducts.length === 0) {
      toast.error("Selecione pelo menos um produto para confirmar");
      return;
    }

    // Simulate order confirmation and payment control integration
    const ordersBySupplier = selectedProducts.reduce((acc, product) => {
      const supplier = product.lastSupplier;
      if (!acc[supplier]) {
        acc[supplier] = {
          products: [],
          total: 0,
          paymentMethod: product.paymentMethod,
          dueDate: new Date(Date.now() + product.daysToPayment * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
      }
      acc[supplier].products.push(product);
      acc[supplier].total += product.targetQuantity * product.unitPrice;
      return acc;
    }, {} as any);

    console.log("Orders created in payment control:", ordersBySupplier);
    
    toast.success(`${selectedProducts.length} pedidos confirmados! Total: R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, {
      description: "Entradas criadas no controle de pagamentos"
    });

    // Reset selected products
    setProducts(products.map(product => ({ ...product, isSelected: false })));
  };

  const getStockIndicator = (level: string) => {
    switch (level) {
      case "critical": return "🔴";
      case "low": return "🟡";
      default: return "🟢";
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
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
      <CardContent className="space-y-4">
        {/* Bulk Controls */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
            />
            <label className="text-sm font-medium">
              Selecionar Todos ({products.length} produtos)
            </label>
          </div>
          <Badge variant="outline">
            {selectedProducts.length} de {products.length} selecionados
          </Badge>
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                product.isSelected 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleProductToggle(product.id)}
              onKeyDown={(e) => handleKeyPress(e, product.id)}
              tabIndex={0}
            >
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={product.isSelected}
                  onCheckedChange={() => handleProductToggle(product.id)}
                  className="h-6 w-6"
                />
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  {/* Product Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStockIndicator(product.stockLevel)}</span>
                      <h4 className="font-semibold">{product.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Estoque: {product.currentStock}{product.unit} | Vende: {product.dailySales}{product.unit}/dia
                    </p>
                  </div>
                  
                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {product.originalStock}{product.unit} →
                    </span>
                    <Input
                      type="number"
                      value={product.targetQuantity}
                      onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                      className="w-20 h-10 text-center font-semibold"
                      min="0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-sm">{product.unit}</span>
                  </div>
                  
                  {/* Supplier */}
                  <div>
                    <Badge variant="secondary" className="font-medium">
                      {product.lastSupplier}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.supplierNote}
                    </p>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-1">
                    <span className="text-sm">R$</span>
                    <Input
                      type="number"
                      value={product.unitPrice.toFixed(2)}
                      onChange={(e) => handlePriceChange(product.id, parseFloat(e.target.value) || 0)}
                      className="w-24 h-10 text-center font-semibold"
                      step="0.01"
                      min="0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-sm">/{product.unit}</span>
                  </div>
                  
                  {/* Payment Method & Total */}
                  <div className="text-right">
                    <Badge className={`${
                      product.paymentMethod === "BOLETO" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {product.paymentMethod}
                    </Badge>
                    <p className="font-bold text-lg mt-1">
                      R$ {(product.targetQuantity * product.unitPrice).toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2 
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Venc: {product.daysToPayment} dias
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <Button
            onClick={handleConfirmOrders}
            disabled={selectedProducts.length === 0}
            className="flex-1 h-14 text-lg font-semibold"
            size="lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Confirmar Pedidos Selecionados ({selectedProducts.length})
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setProducts(products.map(p => ({ ...p, isSelected: false })))}
            className="h-14 px-8"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg text-sm">
          <div>
            <span className="font-medium">Atalhos:</span> Space = Selecionar, Enter = Confirmar
          </div>
          <div>
            <span className="font-medium">Fornecedores:</span> {new Set(selectedProducts.map(p => p.lastSupplier)).size} únicos
          </div>
          <div>
            <span className="font-medium">Integração:</span> Controle de pagamentos automático
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

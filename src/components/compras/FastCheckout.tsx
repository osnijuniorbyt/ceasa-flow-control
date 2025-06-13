
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { FastCheckoutHeader } from "./FastCheckoutHeader";
import { FastCheckoutBulkControls } from "./FastCheckoutBulkControls";
import { FastCheckoutProductItem } from "./FastCheckoutProductItem";
import { FastCheckoutActionButtons } from "./FastCheckoutActionButtons";
import { FastCheckoutQuickInfo } from "./FastCheckoutQuickInfo";

interface FastCheckoutProduct {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  originalStock: number;
  unit: string;
  stockLevel: "critical" | "low" | "medium" | "good";
  suggestedQuantity: number;
  targetQuantity: number;
  lastSupplier: string;
  lastPrice: number;
  unitPrice: number;
  supplierRating: "excellent" | "good" | "warning" | "poor";
  supplierNote: string;
  dailySales: number;
  isSelected: boolean;
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

  const handleClearSelections = () => {
    setProducts(products.map(p => ({ ...p, isSelected: false })));
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <FastCheckoutHeader 
        totalValue={totalValue}
        totalItems={totalItems}
      />
      
      <CardContent className="space-y-4">
        <FastCheckoutBulkControls
          allSelected={allSelected}
          selectedCount={selectedProducts.length}
          totalCount={products.length}
          onSelectAll={handleSelectAll}
        />

        <div className="space-y-3">
          {products.map((product) => (
            <FastCheckoutProductItem
              key={product.id}
              product={product}
              onToggle={handleProductToggle}
              onQuantityChange={handleQuantityChange}
              onPriceChange={handlePriceChange}
              onKeyPress={handleKeyPress}
            />
          ))}
        </div>

        <FastCheckoutActionButtons
          selectedCount={selectedProducts.length}
          onConfirm={handleConfirmOrders}
          onClear={handleClearSelections}
        />

        <FastCheckoutQuickInfo selectedProducts={selectedProducts} />
      </CardContent>
    </Card>
  );
}

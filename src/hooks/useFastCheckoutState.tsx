import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FastCheckoutProduct } from "@/types/fastCheckout";
import { mockFastCheckoutProducts } from "@/data/mockFastCheckoutData";

export function useFastCheckoutState() {
  const [products, setProducts] = useState<FastCheckoutProduct[]>(mockFastCheckoutProducts);
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

  return {
    products,
    allSelected,
    selectedProducts,
    totalValue,
    totalItems,
    handleProductToggle,
    handleQuantityChange,
    handlePriceChange,
    handleSelectAll,
    handleKeyPress,
    handleConfirmOrders,
    handleClearSelections
  };
}
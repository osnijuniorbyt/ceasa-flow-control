import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { FastCheckoutProduct } from "@/types/fastCheckout";
import { PurchaseService } from "@/services/purchaseService";

export function useFastCheckoutState() {
  const [products, setProducts] = useState<FastCheckoutProduct[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load products from service on mount
  useEffect(() => {
    const loadProducts = () => {
      try {
        const savedProducts = PurchaseService.getProducts();
        setProducts(savedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

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

    try {
      // Process orders and save to storage
      const createdOrders = PurchaseService.processOrdersBySupplier(selectedProducts);
      
      // Update local products state with new stock levels
      const updatedProducts = PurchaseService.getProducts();
      setProducts(updatedProducts);

      toast.success(
        `${createdOrders.length} pedido(s) criado(s)! Total: R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        {
          description: `Estoque atualizado para ${selectedProducts.length} produtos`
        }
      );

      // Show details of created orders
      createdOrders.forEach(order => {
        console.log(`Pedido ${order.id} criado:`, {
          fornecedor: order.supplier,
          valor: order.totalValue,
          produtos: order.products.length,
          vencimento: order.dueDate
        });
      });

    } catch (error) {
      console.error('Error creating orders:', error);
      toast.error("Erro ao processar pedidos");
    }
  };

  const handleClearSelections = () => {
    setProducts(products.map(p => ({ ...p, isSelected: false })));
  };

  const handleAddProduct = useCallback((newProduct: FastCheckoutProduct) => {
    // Add the product to the list
    setProducts(prevProducts => [...prevProducts, newProduct]);
  }, []);

  return {
    products,
    allSelected,
    selectedProducts,
    totalValue,
    totalItems,
    loading,
    handleProductToggle,
    handleQuantityChange,
    handlePriceChange,
    handleSelectAll,
    handleKeyPress,
    handleConfirmOrders,
    handleClearSelections,
    handleAddProduct
  };
}
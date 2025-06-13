
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  category: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: any, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotalValue: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: any, quantity: number) => {
    if (quantity <= 0) {
      toast.error("Quantidade deve ser maior que zero");
      return;
    }

    setItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update existing item
        const updatedItems = prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        toast.success(`${product.name} atualizado no carrinho`);
        return updatedItems;
      } else {
        // Add new item
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          unit: product.unit,
          quantity,
          unitPrice: product.lastPrice || product.price || 0,
          supplier: product.lastSupplier || product.supplier || "N/A",
          category: product.category || "Geral"
        };
        toast.success(`${product.name} adicionado ao carrinho`);
        return [...prev, newItem];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === productId);
      if (item) {
        toast.success(`${item.name} removido do carrinho`);
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const clearCart = () => {
    setItems([]);
    toast.success("Carrinho limpo");
  };

  const getTotalValue = () => {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getTotalValue,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

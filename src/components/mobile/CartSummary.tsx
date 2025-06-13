
import { ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export function CartSummary() {
  const { items, updateQuantity, removeItem, clearCart, getTotalValue, getTotalItems } = useCart();

  const handleConfirmOrder = () => {
    if (items.length === 0) {
      toast.error("Carrinho vazio");
      return;
    }

    // Simulate order submission
    const ordersBySupplier = items.reduce((acc, item) => {
      if (!acc[item.supplier]) {
        acc[item.supplier] = [];
      }
      acc[item.supplier].push(item);
      return acc;
    }, {} as Record<string, typeof items>);

    console.log("Pedidos enviados:", ordersBySupplier);
    
    toast.success(
      `Pedido confirmado! ${getTotalItems()} itens - Total: R$ ${getTotalValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      {
        description: "Pedidos enviados para os fornecedores"
      }
    );

    clearCart();
  };

  if (items.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4 text-center text-muted-foreground">
          <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Carrinho vazio</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrinho de Compras
          </div>
          <Badge variant="secondary">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium">{item.name}</h4>
              <p className="text-sm text-muted-foreground">
                {item.quantity} {item.unit} × R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">{item.supplier}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold text-primary">
              R$ {getTotalValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearCart}
              className="flex-1"
            >
              Limpar
            </Button>
            <Button
              onClick={handleConfirmOrder}
              className="flex-1"
            >
              Confirmar Pedido
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

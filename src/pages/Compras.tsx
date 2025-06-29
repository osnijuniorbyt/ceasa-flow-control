
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FastCheckout } from "@/components/compras/FastCheckout";
import { CartSummary } from "@/components/mobile/CartSummary";
import { Zap, ShoppingCart, Clock, DollarSign } from "lucide-react";

const Compras = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 pb-24 space-y-6">
        {/* Mobile Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-primary">Compras Diárias</h1>
          <p className="text-sm text-muted-foreground">
            Sistema otimizado para pedidos rápidos
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-xs text-muted-foreground">Pendentes</div>
                <div className="font-semibold">12 itens</div>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-xs text-muted-foreground">Valor Total</div>
                <div className="font-semibold">R$ 2.450</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Cart Summary - Always visible on mobile */}
        <CartSummary />

        {/* Main Content */}
        <Tabs defaultValue="checkout" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="checkout" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Checkout</span>
              <span className="sm:hidden">Rápido</span>
            </TabsTrigger>
            <TabsTrigger value="cart" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Carrinho</span>
              <span className="sm:hidden">Cart</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checkout" className="space-y-4">
            <FastCheckout />
          </TabsContent>

          <TabsContent value="cart" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrinho Detalhado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CartSummary />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Compras;

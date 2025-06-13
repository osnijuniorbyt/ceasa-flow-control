
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Zap, FileText } from "lucide-react";
import { FastCheckout } from "@/components/compras/FastCheckout";
import { PurchaseOrdersPayment } from "@/components/compras/PurchaseOrdersPayment";

export default function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("fast-checkout");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-8 w-8 text-orange-500" />
            Sistema de Compras Rápidas
          </h2>
          <p className="text-muted-foreground">
            Interface otimizada para pedidos diários com controle financeiro integrado
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fast-checkout" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Checkout Rápido
          </TabsTrigger>
          <TabsTrigger value="order-history" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Histórico de Pedidos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fast-checkout" className="space-y-6">
          <FastCheckout />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Produtos Críticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">3</div>
                <p className="text-xs text-muted-foreground">Precisam reposição urgente</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Fornecedores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">4</div>
                <p className="text-xs text-muted-foreground">Ativos no sistema</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Valor Médio Diário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">R$ 2.450</div>
                <p className="text-xs text-muted-foreground">Baseado nos últimos 7 dias</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="order-history" className="space-y-6">
          <PurchaseOrdersPayment />
        </TabsContent>
      </Tabs>
    </div>
  );
}

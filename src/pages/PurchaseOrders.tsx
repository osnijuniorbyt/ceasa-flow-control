
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Zap, FileText, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { FastCheckout } from "@/components/compras/FastCheckout";
import { PurchaseOrdersPayment } from "@/components/compras/PurchaseOrdersPayment";
import { CompradorInterface } from "@/components/mobile/roles/CompradorInterface";
import { LoadingSkeleton } from "@/components/mobile/LoadingSkeleton";
import { PurchaseNotifications } from "@/components/compras/PurchaseNotifications";
import { PurchaseService } from "@/services/purchaseService";

export default function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("mobile-checkout");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingPayments: 0,
    totalValue: 0,
    criticalProducts: 0,
    lowStockProducts: 0
  });

  // Load stats on component mount and when tab changes
  useEffect(() => {
    if (activeTab === "fast-checkout") {
      const currentStats = PurchaseService.getOrderStats();
      setStats(currentStats);
    }
  }, [activeTab]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center p-4 md:p-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 md:h-8 md:w-8 text-orange-500" />
            Compras Rápidas Mobile
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Interface móvel otimizada para pedidos diários
          </p>
        </div>
        <div className="flex items-center gap-2 md:w-64">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 h-12"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-0">
        <div className="px-4 md:px-0">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="mobile-checkout" className="flex items-center gap-1 text-xs md:text-sm">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTrigger>
            <TabsTrigger value="fast-checkout" className="flex items-center gap-1 text-xs md:text-sm">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Desktop</span>
            </TabsTrigger>
            <TabsTrigger value="order-history" className="flex items-center gap-1 text-xs md:text-sm">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="mobile-checkout" className="space-y-4 md:space-y-6 px-0">
          <CompradorInterface />
        </TabsContent>

        <TabsContent value="fast-checkout" className="space-y-4 md:space-y-6 px-4 md:px-0">
          {isLoading ? (
            <LoadingSkeleton type="card" count={3} />
          ) : (
            <>
              <PurchaseNotifications />
              <FastCheckout />
              
              {/* Real-time Stats */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Produtos Críticos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.criticalProducts}</div>
                    <p className="text-xs text-muted-foreground">Precisam reposição urgente</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      Estoque Baixo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{stats.lowStockProducts}</div>
                    <p className="text-xs text-muted-foreground">Produtos com estoque baixo</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      Pedidos Ativos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">{stats.pendingPayments} pendentes de pagamento</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      Valor Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-muted-foreground">Valor total dos pedidos</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="order-history" className="space-y-4 md:space-y-6 px-4 md:px-0">
          <PurchaseNotifications />
          <PurchaseOrdersPayment />
        </TabsContent>
      </Tabs>
    </div>
  );
}

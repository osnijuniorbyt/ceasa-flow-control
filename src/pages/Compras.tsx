
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Search,
  FileText,
  Users,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import { PurchaseDashboard } from "@/components/compras/PurchaseDashboard";
import { SupplierPaymentDashboard } from "@/components/compras/SupplierPaymentDashboard";
import { PurchaseOrdersPayment } from "@/components/compras/PurchaseOrdersPayment";
import { FinancialReports } from "@/components/compras/FinancialReports";
import { toast } from "sonner";

export default function Compras() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            Controle de Pagamento de Fornecedores
          </h2>
          <p className="text-muted-foreground">
            Sistema completo para gestão de pagamentos e controle financeiro
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar fornecedores, pedidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <PurchaseDashboard />
          
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => setActiveTab("suppliers")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Fornecedores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Gerencie pagamentos e status dos fornecedores
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-green-600">2 em dia</span>
                  <span className="text-yellow-600">2 pendentes</span>
                  <span className="text-red-600">2 em atraso</span>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab("orders")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Pedidos de Compra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Controle de pedidos com rastreamento de pagamentos
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span>4 pedidos ativos</span>
                  <span className="text-orange-600">2 com vencimento próximo</span>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab("reports")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Relatórios Financeiros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Análises e relatórios de pagamentos
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-green-600">R$ 8.450 pagos</span>
                  <span className="text-red-600">R$ 1.250 em atraso</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Alertas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-red-800">Carlos Oliveira (F59)</h4>
                    <p className="text-sm text-red-600">Pagamento vencido há 5 dias - R$ 1.250,00</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Contatar
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-orange-800">Lucia Fernandes (H55)</h4>
                    <p className="text-sm text-orange-600">Vencimento hoje - R$ 450,00</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Pagar
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-yellow-800">Ana Costa (E104)</h4>
                    <p className="text-sm text-yellow-600">Vencimento em 2 dias - R$ 620,00</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Lembrete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <SupplierPaymentDashboard />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <PurchaseOrdersPayment />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <FinancialReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}

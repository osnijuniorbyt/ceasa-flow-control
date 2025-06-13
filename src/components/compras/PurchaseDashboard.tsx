
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Users, AlertTriangle } from "lucide-react";

export function PurchaseDashboard() {
  const dashboardData = {
    pendingOrders: 7,
    totalValuePending: 2850.50,
    suppliersContacted: 4,
    urgentStockAlerts: 12
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.pendingOrders}</div>
          <p className="text-xs text-muted-foreground">
            Aguardando aprovação
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Pendente</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {dashboardData.totalValuePending.toLocaleString('pt-BR', { 
              minimumFractionDigits: 2 
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Para aprovação hoje
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.suppliersContacted}</div>
          <p className="text-xs text-muted-foreground">
            Contatados hoje
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas Urgentes</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {dashboardData.urgentStockAlerts}
          </div>
          <p className="text-xs text-muted-foreground">
            Produtos críticos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Download,
  Calendar,
  FileText
} from "lucide-react";
import { PaymentReport } from "@/types/compras";

export function FinancialReports() {
  const monthlyReport: PaymentReport = {
    period: "Janeiro 2024",
    totalPaid: 8450.00,
    totalPending: 2720.00,
    totalOverdue: 1250.00,
    suppliersCount: 6,
    averagePaymentDelay: 2.5,
    paymentsByMethod: {
      notaFiscal: 4850.00,
      boleto: 3600.00
    }
  };

  const overdueSuppliers = [
    { name: "Carlos Oliveira", code: "F59", amount: 1250.00, daysPastDue: 5 },
    { name: "Maria Santos", code: "E10", amount: 850.00, daysPastDue: 2 }
  ];

  const upcomingPayments = [
    { supplier: "Ana Costa", code: "E104", amount: 620.00, dueDate: "2024-01-19", daysLeft: 2 },
    { supplier: "Lucia Fernandes", code: "H55", amount: 450.00, dueDate: "2024-01-17", daysLeft: 0 },
    { supplier: "João Silva", code: "D22 rua", amount: 1500.00, dueDate: "2024-01-22", daysLeft: 5 }
  ];

  const paymentHistory = [
    { date: "2024-01-15", supplier: "Pedro Mendes", code: "F100", amount: 890.00, method: "BOLETO" },
    { date: "2024-01-14", supplier: "João Silva", code: "D22 rua", amount: 1200.00, method: "NOTA FISCAL" },
    { date: "2024-01-13", supplier: "Carlos Oliveira", code: "F59", amount: 600.00, method: "BOLETO" },
    { date: "2024-01-12", supplier: "Ana Costa", code: "E104", amount: 750.00, method: "NOTA FISCAL" }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago (Mês)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {monthlyReport.totalPaid.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2 
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {monthlyReport.paymentsByMethod.notaFiscal > monthlyReport.paymentsByMethod.boleto 
                ? "Nota Fiscal predomina" 
                : "Boleto predomina"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {monthlyReport.totalPending.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2 
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Para pagamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {monthlyReport.totalOverdue.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2 
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagamentos vencidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atraso Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyReport.averagePaymentDelay} dias
            </div>
            <p className="text-xs text-muted-foreground">
              Média de atraso nos pagamentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumo Geral</TabsTrigger>
          <TabsTrigger value="overdue">Em Atraso</TabsTrigger>
          <TabsTrigger value="upcoming">Próximos Vencimentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Nota Fiscal</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      R$ {monthlyReport.paymentsByMethod.notaFiscal.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2 
                      })}
                    </span>
                    <Badge variant="secondary">
                      {((monthlyReport.paymentsByMethod.notaFiscal / monthlyReport.totalPaid) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Boleto</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      R$ {monthlyReport.paymentsByMethod.boleto.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2 
                      })}
                    </span>
                    <Badge variant="secondary">
                      {((monthlyReport.paymentsByMethod.boleto / monthlyReport.totalPaid) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status dos Fornecedores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total de Fornecedores</span>
                    <span className="font-semibold">{monthlyReport.suppliersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Com Pagamentos em Dia</span>
                    <span className="font-semibold text-green-600">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Com Pagamentos Pendentes</span>
                    <span className="font-semibold text-yellow-600">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Com Pagamentos em Atraso</span>
                    <span className="font-semibold text-red-600">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Pagamentos em Atraso</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fornecedores com pagamentos vencidos que precisam de atenção imediata
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overdueSuppliers.map((supplier, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <h4 className="font-semibold">{supplier.name} ({supplier.code})</h4>
                      <p className="text-sm text-red-600">
                        {supplier.daysPastDue} dias em atraso
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        R$ {supplier.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <Button size="sm" variant="outline" className="mt-1">
                        Contatar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">Próximos Vencimentos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pagamentos que vencem nos próximos 7 dias
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingPayments.map((payment, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 border rounded-lg ${
                    payment.daysLeft <= 0 ? "border-red-200 bg-red-50" : 
                    payment.daysLeft <= 3 ? "border-orange-200 bg-orange-50" : 
                    "border-gray-200"
                  }`}>
                    <div>
                      <h4 className="font-semibold">{payment.supplier} ({payment.code})</h4>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>Vence em {payment.dueDate}</span>
                      </div>
                      <p className={`text-sm ${
                        payment.daysLeft <= 0 ? "text-red-600" : 
                        payment.daysLeft <= 3 ? "text-orange-600" : 
                        "text-muted-foreground"
                      }`}>
                        {payment.daysLeft <= 0 ? "Vencido hoje" : `${payment.daysLeft} dias restantes`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <Button size="sm" variant="outline" className="mt-1">
                        Pagar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{payment.supplier} ({payment.code})</h4>
                      <p className="text-sm text-muted-foreground">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {payment.method}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório Completo
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </Button>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Análise Detalhada
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

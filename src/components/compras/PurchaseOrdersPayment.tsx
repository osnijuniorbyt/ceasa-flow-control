
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, Search, AlertTriangle, Calendar, CreditCard } from "lucide-react";
import { PurchaseOrder } from "@/types/compras";
import { toast } from "sonner";

export function PurchaseOrdersPayment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<PurchaseOrder[]>([
    {
      id: "PO-001",
      date: "2024-01-15",
      supplier: "João Silva",
      supplierCode: "D22 rua",
      products: [],
      totalValue: 1500.00,
      status: "delivered",
      paymentStatus: "PENDENTE",
      paymentMethod: "NOTA FISCAL",
      dueDate: "2024-01-22",
      isPaid: false
    },
    {
      id: "PO-002",
      date: "2024-01-14",
      supplier: "Maria Santos",
      supplierCode: "E10",
      products: [],
      totalValue: 850.00,
      status: "delivered",
      paymentStatus: "VENCIDO",
      paymentMethod: "BOLETO",
      dueDate: "2024-01-18",
      isPaid: false
    },
    {
      id: "PO-003",
      date: "2024-01-13",
      supplier: "Carlos Oliveira",
      supplierCode: "F59",
      products: [],
      totalValue: 600.00,
      status: "delivered",
      paymentStatus: "PAGO",
      paymentMethod: "BOLETO",
      dueDate: "2024-01-20",
      isPaid: true,
      paymentDate: "2024-01-19"
    },
    {
      id: "PO-004",
      date: "2024-01-12",
      supplier: "Ana Costa",
      supplierCode: "E104",
      products: [],
      totalValue: 750.00,
      status: "confirmed",
      paymentStatus: "PENDENTE",
      paymentMethod: "NOTA FISCAL",
      dueDate: "2024-01-19",
      isPaid: false
    }
  ]);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAGO":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDENTE":
        return "bg-red-100 text-red-800 border-red-200";
      case "VENCIDO":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "sent":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const shouldShowDueAlert = (dueDate: string, paymentStatus: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    return (daysUntilDue <= 3 && paymentStatus !== "PAGO") || paymentStatus === "VENCIDO";
  };

  const handlePaymentToggle = (orderId: string, isPaid: boolean) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          isPaid,
          paymentStatus: isPaid ? "PAGO" : "PENDENTE",
          paymentDate: isPaid ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return order;
    }));
    
    toast.success(isPaid ? "Pagamento registrado com sucesso" : "Pagamento desmarcado");
  };

  const totalOwedBySupplier = (supplier: string) => {
    return orders
      .filter(order => order.supplier === supplier && !order.isPaid)
      .reduce((sum, order) => sum + order.totalValue, 0);
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplierCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pedidos de Compra - Controle de Pagamentos
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Gerencie pedidos e acompanhe status de pagamentos
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <Input
            placeholder="Buscar por pedido, fornecedor ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`p-4 border rounded-lg ${
                shouldShowDueAlert(order.dueDate, order.paymentStatus) 
                  ? "border-orange-200 bg-orange-50" 
                  : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{order.id}</h4>
                    <Badge className={getOrderStatusColor(order.status)}>
                      {order.status === "delivered" ? "Entregue" : 
                       order.status === "confirmed" ? "Confirmado" : 
                       order.status === "sent" ? "Enviado" : "Rascunho"}
                    </Badge>
                    <Badge className={`${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </Badge>
                    {shouldShowDueAlert(order.dueDate, order.paymentStatus) && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Fornecedor</p>
                      <p>{order.supplier} ({order.supplierCode})</p>
                      <p className="text-xs text-orange-600">
                        Total devido: R$ {totalOwedBySupplier(order.supplier).toLocaleString('pt-BR', { 
                          minimumFractionDigits: 2 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Valor Total</p>
                      <p className="font-semibold">
                        R$ {order.totalValue.toLocaleString('pt-BR', { 
                          minimumFractionDigits: 2 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Método de Pagamento</p>
                      <Badge variant="secondary" className="text-xs">
                        {order.paymentMethod}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Vencimento</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className={`text-xs ${
                          getDaysUntilDue(order.dueDate) <= 3 && !order.isPaid ? "text-orange-600" : ""
                        }`}>
                          {order.dueDate}
                        </span>
                      </div>
                      {!order.isPaid && getDaysUntilDue(order.dueDate) <= 3 && (
                        <p className="text-xs text-orange-600">
                          {getDaysUntilDue(order.dueDate) < 0 
                            ? `${Math.abs(getDaysUntilDue(order.dueDate))} dias em atraso`
                            : `${getDaysUntilDue(order.dueDate)} dias restantes`
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`payment-${order.id}`}
                    checked={order.isPaid}
                    onCheckedChange={(checked) => 
                      handlePaymentToggle(order.id, checked as boolean)
                    }
                  />
                  <label htmlFor={`payment-${order.id}`} className="text-sm font-medium">
                    Marcar como Pago
                  </label>
                  {order.isPaid && order.paymentDate && (
                    <span className="text-xs text-green-600">
                      (Pago em {order.paymentDate})
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" size="sm">
                    Contatar Fornecedor
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

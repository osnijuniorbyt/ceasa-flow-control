
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Calendar, CreditCard, DollarSign } from "lucide-react";
import { Supplier } from "@/types/compras";

export function SupplierPaymentDashboard() {
  const suppliers: Supplier[] = [
    {
      id: "S001",
      name: "João Silva",
      code: "D22 rua",
      location: "Setor D, Box 22",
      rating: 4.8,
      reliability: 98,
      lastOrderDate: "2024-01-15",
      specialties: ["Verduras", "Temperos"],
      contact: "(11) 99999-1234",
      notes: "Sempre pontual, produtos frescos",
      totalOrders: 45,
      onTimeDelivery: 98,
      paymentMethod: "NOTA FISCAL",
      paymentStatus: "PAGO",
      outstandingAmount: 0,
      lastPaymentDate: "2024-01-14",
      nextDueDate: "2024-01-28"
    },
    {
      id: "S002",
      name: "Maria Santos",
      code: "E10",
      location: "Setor E, Box 10",
      rating: 4.9,
      reliability: 95,
      lastOrderDate: "2024-01-14",
      specialties: ["Frutas", "Morangos"],
      contact: "(11) 98888-5678",
      notes: "Melhor qualidade de morangos",
      totalOrders: 38,
      onTimeDelivery: 95,
      paymentMethod: "BOLETO",
      paymentStatus: "PENDENTE",
      outstandingAmount: 850.00,
      lastPaymentDate: "2024-01-10",
      nextDueDate: "2024-01-18"
    },
    {
      id: "S003",
      name: "Carlos Oliveira",
      code: "F59",
      location: "Setor F, Box 59",
      rating: 3.8,
      reliability: 75,
      lastOrderDate: "2024-01-13",
      specialties: ["Legumes", "Tomates"],
      contact: "(11) 97777-9012",
      notes: "Preços competitivos, qualidade variável",
      totalOrders: 22,
      onTimeDelivery: 75,
      paymentMethod: "BOLETO",
      paymentStatus: "VENCIDO",
      outstandingAmount: 1250.00,
      lastPaymentDate: "2024-01-05",
      nextDueDate: "2024-01-12"
    },
    {
      id: "S004",
      name: "Ana Costa",
      code: "E104",
      location: "Setor E, Box 104",
      rating: 4.5,
      reliability: 90,
      lastOrderDate: "2024-01-12",
      specialties: ["Tubérculos", "Raízes"],
      contact: "(11) 96666-3456",
      notes: "Especialista em batatas e mandioca",
      totalOrders: 31,
      onTimeDelivery: 90,
      paymentMethod: "NOTA FISCAL",
      paymentStatus: "PENDENTE",
      outstandingAmount: 620.00,
      lastPaymentDate: "2024-01-08",
      nextDueDate: "2024-01-19"
    },
    {
      id: "S005",
      name: "Pedro Mendes",
      code: "F100",
      location: "Setor F, Box 100",
      rating: 4.2,
      reliability: 88,
      lastOrderDate: "2024-01-11",
      specialties: ["Frutas Cítricas"],
      contact: "(11) 95555-7890",
      notes: "Especialista em laranjas e limões",
      totalOrders: 28,
      onTimeDelivery: 88,
      paymentMethod: "BOLETO",
      paymentStatus: "PAGO",
      outstandingAmount: 0,
      lastPaymentDate: "2024-01-13",
      nextDueDate: "2024-01-27"
    },
    {
      id: "S006",
      name: "Lucia Fernandes",
      code: "H55",
      location: "Setor H, Box 55",
      rating: 4.6,
      reliability: 92,
      lastOrderDate: "2024-01-10",
      specialties: ["Ervas", "Aromáticas"],
      contact: "(11) 94444-1234",
      notes: "Melhor seleção de ervas frescas",
      totalOrders: 35,
      onTimeDelivery: 92,
      paymentMethod: "NOTA FISCAL",
      paymentStatus: "PENDENTE",
      outstandingAmount: 450.00,
      lastPaymentDate: "2024-01-07",
      nextDueDate: "2024-01-17"
    }
  ];

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

  const getPaymentMethodIcon = (method: string) => {
    return method === "NOTA FISCAL" ? "NF" : "BL";
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const shouldShowAlert = (supplier: Supplier) => {
    const daysUntilDue = getDaysUntilDue(supplier.nextDueDate);
    return daysUntilDue <= 3 || supplier.paymentStatus === "VENCIDO";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Dashboard de Pagamentos - Fornecedores
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Controle de pagamentos e status financeiro dos fornecedores
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className={`p-4 border rounded-lg ${
                shouldShowAlert(supplier) ? "border-orange-200 bg-orange-50" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{supplier.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {supplier.code}
                    </Badge>
                    <Badge className={`text-xs ${getPaymentStatusColor(supplier.paymentStatus)}`}>
                      {supplier.paymentStatus}
                    </Badge>
                    {shouldShowAlert(supplier) && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {supplier.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Método de Pagamento</p>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {getPaymentMethodIcon(supplier.paymentMethod)}
                    </Badge>
                    <span className="text-xs">{supplier.paymentMethod}</span>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-muted-foreground">Valor Pendente</p>
                  <p className={`font-semibold ${
                    supplier.outstandingAmount > 0 ? "text-red-600" : "text-green-600"
                  }`}>
                    R$ {supplier.outstandingAmount.toLocaleString('pt-BR', { 
                      minimumFractionDigits: 2 
                    })}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-muted-foreground">Último Pagamento</p>
                  <p className="text-xs">{supplier.lastPaymentDate}</p>
                </div>

                <div>
                  <p className="font-medium text-muted-foreground">Próximo Vencimento</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className={`text-xs ${
                      getDaysUntilDue(supplier.nextDueDate) <= 3 ? "text-orange-600" : ""
                    }`}>
                      {supplier.nextDueDate}
                    </span>
                  </div>
                  {getDaysUntilDue(supplier.nextDueDate) <= 3 && (
                    <p className="text-xs text-orange-600">
                      {getDaysUntilDue(supplier.nextDueDate) < 0 
                        ? `${Math.abs(getDaysUntilDue(supplier.nextDueDate))} dias em atraso`
                        : `${getDaysUntilDue(supplier.nextDueDate)} dias restantes`
                      }
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Registrar Pagamento
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Histórico
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Contato
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

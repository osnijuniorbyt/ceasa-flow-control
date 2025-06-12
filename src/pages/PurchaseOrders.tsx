
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";

export default function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState("");

  const orders = [
    {
      id: "PO-001",
      supplier: "Fornecedor ABC",
      products: "Tomates, Alface, Cenoura",
      total: "R$ 1.500,00",
      status: "Pendente",
      date: "2024-01-15",
    },
    {
      id: "PO-002",
      supplier: "Hortifruti XYZ",
      products: "Bananas, Maçãs, Laranjas",
      total: "R$ 800,00",
      status: "Aprovado",
      date: "2024-01-14",
    },
    {
      id: "PO-003",
      supplier: "Verduras Frescas",
      products: "Brócolis, Couve-flor",
      total: "R$ 600,00",
      status: "Entregue",
      date: "2024-01-13",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      case "Aprovado":
        return "bg-blue-100 text-blue-800";
      case "Entregue":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pedidos de Compra</h2>
          <p className="text-muted-foreground">
            Gerencie todos os pedidos de compra
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Buscar pedidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{order.id}</h4>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Fornecedor:</strong> {order.supplier}
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Produtos:</strong> {order.products}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Data:</strong> {order.date} | <strong>Total:</strong> {order.total}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

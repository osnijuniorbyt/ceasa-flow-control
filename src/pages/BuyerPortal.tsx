
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingCart, Clock, CheckCircle } from "lucide-react";

export default function BuyerPortal() {
  const buyers = [
    {
      id: "B001",
      name: "João Silva",
      company: "Mercado Central",
      orders: 15,
      status: "Ativo",
      lastOrder: "2024-01-15",
    },
    {
      id: "B002", 
      name: "Maria Santos",
      company: "Supermercado Bom Preço",
      orders: 8,
      status: "Ativo",
      lastOrder: "2024-01-14",
    },
    {
      id: "B003",
      name: "Carlos Oliveira",
      company: "Quitanda do Bairro",
      orders: 23,
      status: "Pendente",
      lastOrder: "2024-01-10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Portal do Comprador</h2>
        <p className="text-muted-foreground">
          Gerencie compradores e suas atividades
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Compradores
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12% desde o último mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos Ativos
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">43</div>
            <p className="text-xs text-muted-foreground">
              +5% desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aprovações Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Requer atenção
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compradores Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {buyers.map((buyer) => (
              <div
                key={buyer.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{buyer.name}</h4>
                    <Badge 
                      className={buyer.status === "Ativo" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {buyer.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Empresa:</strong> {buyer.company}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Pedidos:</strong> {buyer.orders} | <strong>Último pedido:</strong> {buyer.lastOrder}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                  {buyer.status === "Pendente" && (
                    <Button size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

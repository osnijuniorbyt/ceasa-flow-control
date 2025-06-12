
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, Clock, CheckCircle } from "lucide-react";

export default function Deliveries() {
  const deliveries = [
    {
      id: "D001",
      driver: "José Silva",
      vehicle: "Caminhão - ABC-1234",
      destination: "Mercado Central",
      products: "Tomates, Alface (50kg)",
      status: "Em Trânsito",
      estimatedTime: "14:30",
      distance: "15km",
    },
    {
      id: "D002",
      driver: "Maria Santos",
      vehicle: "Van - XYZ-5678",
      destination: "Supermercado Bom Preço",
      products: "Bananas, Maçãs (30kg)",
      status: "Entregue",
      estimatedTime: "13:45",
      distance: "8km",
    },
    {
      id: "D003",
      driver: "Carlos Oliveira",
      vehicle: "Caminhão - DEF-9012",
      destination: "Quitanda do Bairro",
      products: "Cenouras, Brócolis (25kg)",
      status: "Programada",
      estimatedTime: "16:00",
      distance: "12km",
    },
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Em Trânsito":
        return { color: "bg-blue-100 text-blue-800", icon: Truck };
      case "Entregue":
        return { color: "bg-green-100 text-green-800", icon: CheckCircle };
      case "Programada":
        return { color: "bg-yellow-100 text-yellow-800", icon: Clock };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: Package };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Entregas</h2>
        <p className="text-muted-foreground">
          Controle de entregas e logística
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entregas Hoje
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              15 concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Em Trânsito
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Saídas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Programadas
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Para hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tempo Médio
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45min</div>
            <p className="text-xs text-muted-foreground">
              Por entrega
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entregas em Andamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveries.map((delivery) => {
              const statusInfo = getStatusInfo(delivery.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div
                  key={delivery.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{delivery.id}</h4>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {delivery.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p><strong>Motorista:</strong> {delivery.driver}</p>
                        <p><strong>Veículo:</strong> {delivery.vehicle}</p>
                      </div>
                      <div>
                        <p><strong>Destino:</strong> {delivery.destination}</p>
                        <p><strong>Produtos:</strong> {delivery.products}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span><strong>Previsão:</strong> {delivery.estimatedTime}</span>
                      <span><strong>Distância:</strong> {delivery.distance}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Rastrear
                    </Button>
                    {delivery.status === "Programada" && (
                      <Button size="sm">
                        Iniciar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

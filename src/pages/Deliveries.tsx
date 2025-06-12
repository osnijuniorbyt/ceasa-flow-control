
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, Clock, CheckCircle } from "lucide-react";

export default function Deliveries() {
  const deliveries = [
    {
      id: "E10",
      driver: "João Silva",
      vehicle: "Fiorino - ABC-1234",
      destination: "Feira do Produtor",
      products: "Moranguinho - 4 unidades",
      status: "Entregue",
      estimatedTime: "09:30",
      distance: "3km",
    },
    {
      id: "F59",
      driver: "Maria Santos",
      vehicle: "Kombi - XYZ-5678",
      destination: "Mercadinho Central",
      products: "Alho desc 500g - 5 pacotes",
      status: "Em Trânsito",
      estimatedTime: "11:15",
      distance: "2km",
    },
    {
      id: "D22",
      driver: "Carlos Oliveira",
      vehicle: "Pick-up - DEF-9012",
      destination: "Quitanda do Bairro",
      products: "Alface hidroponica - 8 unidades",
      status: "Programada",
      estimatedTime: "14:00",
      distance: "1.5km",
    },
    {
      id: "E104",
      driver: "Ana Costa",
      vehicle: "Van - GHI-3456",
      destination: "Restaurante Sabor",
      products: "Baroa granel - 3kg",
      status: "Programada",
      estimatedTime: "15:30",
      distance: "4km",
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
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              2 concluídas
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
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Saída ativa
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
            <div className="text-2xl font-bold">2</div>
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
            <div className="text-2xl font-bold">25min</div>
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


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Truck, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Produtos em Estoque",
      value: "1,234",
      icon: Package,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Pedidos Pendentes",
      value: "56",
      icon: ShoppingCart,
      change: "+5%",
      changeType: "positive" as const,
    },
    {
      title: "Entregas Hoje",
      value: "23",
      icon: Truck,
      change: "-2%",
      changeType: "negative" as const,
    },
    {
      title: "Alertas",
      value: "8",
      icon: AlertTriangle,
      change: "+3",
      changeType: "warning" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do sistema de controle de fluxo CEASA
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={`text-xs ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : stat.changeType === "negative"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {stat.change} desde o último mês
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm">Novo pedido recebido #1234</p>
                  <p className="text-xs text-muted-foreground">Há 5 minutos</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm">Entrega concluída #5678</p>
                  <p className="text-xs text-muted-foreground">Há 15 minutos</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm">Estoque baixo: Tomates</p>
                  <p className="text-xs text-muted-foreground">Há 30 minutos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sistema Online</span>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Última Sincronização</span>
                <span className="text-sm text-muted-foreground">Agora</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Conectividade</span>
                <span className="text-sm text-green-600">Excelente</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Truck, AlertTriangle, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  const stats = [
    {
      title: "Produtos em Estoque",
      value: "28",
      icon: Package,
      change: "+2",
      changeType: "positive" as const,
    },
    {
      title: "Pedidos Pendentes",
      value: "12",
      icon: ShoppingCart,
      change: "+3",
      changeType: "positive" as const,
    },
    {
      title: "Entregas Hoje",
      value: "5",
      icon: Truck,
      change: "+1",
      changeType: "positive" as const,
    },
    {
      title: "Alertas",
      value: "3",
      icon: AlertTriangle,
      change: "estoque baixo",
      changeType: "warning" as const,
    },
  ];

  return (
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral do sistema de controle de fluxo CEASA
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/fornecedores-gestao")}
            variant="outline"
            className="gap-2"
          >
            <Truck className="h-4 w-4" />
            Fornecedores
          </Button>
          <Button
            onClick={() => navigate("/produtos-gestao")}
            variant="outline"
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Produtos
          </Button>
        </div>
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
                    : stat.changeType === "warning"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {stat.change} {stat.changeType !== "warning" && "desde ontem"}
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
                  <p className="text-sm">Pedido D22 rua: Alface hidroponica - 10 unidades</p>
                  <p className="text-xs text-muted-foreground">Há 15 minutos</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm">Entrega E10: Moranguinho - 4 unidades recebidas</p>
                  <p className="text-xs text-muted-foreground">Há 25 minutos</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm">Alerta: Tomate grape baixo estoque</p>
                  <p className="text-xs text-muted-foreground">Há 45 minutos</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm">Pedido F59: Alho desc 500g - aguardando preço</p>
                  <p className="text-xs text-muted-foreground">Há 1 hora</p>
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
              <div className="flex justify-between items-center">
                <span className="text-sm">Produtos Ativos</span>
                <span className="text-sm text-muted-foreground">28 tipos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;

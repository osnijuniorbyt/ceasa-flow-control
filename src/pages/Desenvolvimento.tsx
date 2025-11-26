import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, FileText, BarChart3, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Desenvolvimento() {
  const navigate = useNavigate();

  const modulos = [
    {
      id: "relatorios",
      titulo: "Relatórios",
      descricao: "Comparativo de lotes e análises",
      icon: FileText,
      rota: "/desenvolvimento/relatorios",
      status: "Em desenvolvimento"
    },
    {
      id: "dashboard",
      titulo: "Dashboard",
      descricao: "Visão geral e métricas",
      icon: BarChart3,
      rota: "/desenvolvimento/dashboard",
      status: "Planejado"
    },
    {
      id: "configuracoes",
      titulo: "Configurações Avançadas",
      descricao: "Configurações do sistema",
      icon: Settings,
      rota: "/desenvolvimento/config",
      status: "Planejado"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="bg-black text-white p-4 rounded-lg mb-6">
        <div className="flex items-center gap-3">
          <Construction className="h-8 w-8 text-yellow-500" />
          <div>
            <h1 className="text-2xl font-light tracking-wide">DESENVOLVIMENTO</h1>
            <p className="text-sm text-gray-400">Módulos em construção</p>
          </div>
        </div>
      </div>

      {/* Lista de Módulos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modulos.map((modulo) => {
          const Icon = modulo.icon;
          return (
            <Card key={modulo.id} className="border-2 border-dashed">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Icon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    {modulo.status}
                  </span>
                </div>
                <CardTitle className="mt-3">{modulo.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {modulo.descricao}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(modulo.rota)}
                  disabled={modulo.status === "Planejado"}
                >
                  {modulo.status === "Planejado" ? "Em breve" : "Acessar"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Button variant="ghost" onClick={() => navigate("/")}>
          ← Voltar para Área Operacional
        </Button>
      </div>
    </div>
  );
}

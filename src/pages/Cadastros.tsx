import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Users, Box, Layers } from "lucide-react";

export default function Cadastros() {
  const navigate = useNavigate();

  const cadastros = [
    {
      title: "Produtos",
      description: "Gerencie produtos, categorias e preços",
      icon: Package,
      path: "/produtos-gestao",
      color: "bg-blue-500"
    },
    {
      title: "Fornecedores",
      description: "Cadastro e gestão de fornecedores",
      icon: Users,
      path: "/fornecedores-gestao",
      color: "bg-green-500"
    },
    {
      title: "Embalagens",
      description: "Configure tipos de embalagens",
      icon: Box,
      path: "/produtos-gestao?tab=vasilhames",
      color: "bg-purple-500"
    },
    {
      title: "Categorias",
      description: "Grupos e subgrupos de produtos",
      icon: Layers,
      path: "/categories",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-black text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <h1 className="text-xl font-light tracking-wide">CADASTROS</h1>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground mb-6">
          Acesse as áreas de cadastro e configuração do sistema
        </p>

        <div className="grid gap-3">
          {cadastros.map((cadastro) => {
            const Icon = cadastro.icon;
            return (
              <Card
                key={cadastro.path}
                className="border hover:shadow-lg transition-all cursor-pointer hover:border-primary"
                onClick={() => navigate(cadastro.path)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`${cadastro.color} p-3 rounded-lg text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1">{cadastro.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {cadastro.description}
                      </p>
                    </div>
                    <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

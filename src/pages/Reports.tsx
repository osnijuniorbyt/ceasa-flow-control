
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Download, FileText, TrendingUp, Package, Users, Brain } from "lucide-react";
import { ProductPerformance } from "@/components/reports/ProductPerformance";
import { CategoryBreakdown } from "@/components/reports/CategoryBreakdown";
import { SupplierScorecard } from "@/components/reports/SupplierScorecard";
import { ExecutiveSummary } from "@/components/reports/ExecutiveSummary";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("executive");

  const reports = [
    {
      id: "R001",
      name: "Relatório de Vendas Diário",
      type: "Vendas",
      period: "Hoje",
      status: "Disponível",
      generatedAt: "09:00",
    },
    {
      id: "R002",
      name: "Inventário Semanal",
      type: "Estoque",
      period: "Esta Semana",
      status: "Processando",
      generatedAt: "Em processamento...",
    },
    {
      id: "R003",
      name: "Performance de Fornecedores",
      type: "Fornecedores",
      period: "Último Mês",
      status: "Disponível",
      generatedAt: "Ontem 18:30",
    },
  ];

  const quickStats = [
    {
      title: "Vendas Hoje",
      value: "R$ 1.840",
      change: "+12%",
      positive: true,
    },
    {
      title: "Produtos Vendidos",
      value: "156",
      change: "+8",
      positive: true,
    },
    {
      title: "Margem de Lucro",
      value: "40%",
      change: "+2%",
      positive: true,
    },
    {
      title: "Fornecedores Ativos",
      value: "8",
      change: "estáveis",
      positive: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground">
            Análises completas e insights de IA do sistema CEASA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button>
            <Brain className="h-4 w-4 mr-2" />
            Gerar Insights IA
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} desde ontem
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="executive">Resumo Executivo</TabsTrigger>
          <TabsTrigger value="products">Performance Produtos</TabsTrigger>
          <TabsTrigger value="categories">Análise Categorias</TabsTrigger>
          <TabsTrigger value="suppliers">Scorecard Fornecedores</TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-4">
          <ExecutiveSummary />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <ProductPerformance />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoryBreakdown />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <SupplierScorecard />
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-4 w-4" />
                      <h4 className="font-semibold">{report.name}</h4>
                      <Badge 
                        className={report.status === "Disponível" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {report.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Tipo:</strong> {report.type}</p>
                      <p><strong>Período:</strong> {report.period}</p>
                      <p><strong>Gerado:</strong> {report.generatedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.status === "Disponível" && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Visualizar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gerar Novo Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-3">
                <Button className="justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatório de Vendas
                </Button>
                <Button variant="outline" className="justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Relatório de Estoque
                </Button>
                <Button variant="outline" className="justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Análise de Fornecedores
                </Button>
                <Button variant="outline" className="justify-start">
                  <Brain className="h-4 w-4 mr-2" />
                  Insights de IA
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Relatórios Avançados</h4>
                <Button variant="outline" className="w-full">
                  Criar Relatório Personalizado
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Brain, TrendingUp, AlertTriangle, Target, RefreshCw } from "lucide-react";

const chartConfig = {
  revenue: { label: "Receita", color: "#3b82f6" },
  profit: { label: "Lucro", color: "#22c55e" }
};

export function ExecutiveSummary() {
  const weeklyData = [
    { day: "Seg", revenue: 1200, profit: 480 },
    { day: "Ter", revenue: 1450, profit: 580 },
    { day: "Qua", revenue: 1100, profit: 440 },
    { day: "Qui", revenue: 1680, profit: 672 },
    { day: "Sex", revenue: 1890, profit: 756 },
    { day: "Sáb", revenue: 2100, profit: 840 },
    { day: "Dom", revenue: 1580, profit: 632 }
  ];

  const aiInsights = [
    {
      type: "positive",
      title: "Crescimento Sustentável",
      description: "Vendas de verduras hidropônicas cresceram 23% no último mês. Recomenda-se expandir parcerias com D22 Hidropônicos.",
      confidence: 95,
      priority: "Alta"
    },
    {
      type: "warning",
      title: "Estoque Crítico",
      description: "Tomate grape apresenta baixo estoque há 3 dias. Risco de perda de vendas estimado em R$ 2.400 esta semana.",
      confidence: 88,
      priority: "Urgente"
    },
    {
      type: "opportunity",
      title: "Oportunidade de Margem",
      description: "Temperos têm margem 15% acima da média. Considere expandir linha de produtos aromáticos e especiarias.",
      confidence: 82,
      priority: "Média"
    },
    {
      type: "insight",
      title: "Padrão Sazonal",
      description: "Vendas de tubérculos aumentam 30% após 15h. Ajustar estratégia de precificação para período vespertino.",
      confidence: 91,
      priority: "Média"
    }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "opportunity":
        return <Target className="h-4 w-4 text-blue-600" />;
      default:
        return <Brain className="h-4 w-4 text-purple-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Urgente":
        return <Badge className="bg-red-100 text-red-800">{priority}</Badge>;
      case "Alta":
        return <Badge className="bg-orange-100 text-orange-800">{priority}</Badge>;
      case "Média":
        return <Badge className="bg-blue-100 text-blue-800">{priority}</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Resumo Executivo com IA
            </CardTitle>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Insights
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="text-2xl font-bold text-green-600">R$ 11.420</h3>
              <p className="text-sm text-muted-foreground">Receita Semanal</p>
              <p className="text-xs text-green-600">+12% vs semana anterior</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="text-2xl font-bold text-blue-600">R$ 4.568</h3>
              <p className="text-sm text-muted-foreground">Lucro Semanal</p>
              <p className="text-xs text-blue-600">Margem: 40%</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="text-2xl font-bold text-purple-600">156</h3>
              <p className="text-sm text-muted-foreground">Produtos Vendidos</p>
              <p className="text-xs text-purple-600">+8% vs semana anterior</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="text-2xl font-bold text-orange-600">94%</h3>
              <p className="text-sm text-muted-foreground">Satisfação Clientes</p>
              <p className="text-xs text-orange-600">+2% vs mês anterior</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Tendência Semanal</h3>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Receita"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Lucro"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insights de IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(insight.priority)}
                        <Badge variant="outline">{insight.confidence}% confiança</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

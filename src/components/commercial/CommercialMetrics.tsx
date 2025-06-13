
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, BarChart3, CheckCircle, AlertCircle } from "lucide-react";

export function CommercialMetrics() {
  const marginAnalysis = [
    { product: "Alface", predicted: 45, actual: 42, variance: -3, status: "ok" },
    { product: "Tomate", predicted: 50, actual: 53, variance: +3, status: "good" },
    { product: "Morango", predicted: 47, actual: 39, variance: -8, status: "alert" },
    { product: "Batata", predicted: 40, actual: 38, variance: -2, status: "ok" }
  ];

  const salesPerformance = [
    { product: "Alface", predicted: 25, actual: 28, accuracy: 88 },
    { product: "Tomate", predicted: 15, actual: 13, accuracy: 87 },
    { product: "Morango", predicted: 20, actual: 18, accuracy: 90 },
    { product: "Batata", predicted: 30, actual: 32, accuracy: 93 }
  ];

  const getVarianceColor = (variance: number) => {
    if (variance >= 0) return "text-green-600";
    if (variance >= -5) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "alert": return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-600";
    if (accuracy >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Análise de Margem - Previsto vs Real
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparação entre margens previstas e realizadas
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marginAnalysis.map((item, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.product}</span>
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getVarianceColor(item.variance)}`}>
                      {item.variance > 0 ? '+' : ''}{item.variance}%
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Previsto:</div>
                    <div className="font-medium">{item.predicted}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Real:</div>
                    <div className="font-medium">{item.actual}%</div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <Progress value={(item.actual / item.predicted) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance de Vendas
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Precisão das previsões de vendas da IA
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesPerformance.map((item, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.product}</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {item.accuracy}% precisão
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                  <div>
                    <div className="text-muted-foreground">IA previu:</div>
                    <div className="font-medium">{item.predicted} kg</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Vendido:</div>
                    <div className="font-medium">{item.actual} kg</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Progress value={item.accuracy} className="flex-1 h-2" />
                  <span className={`text-xs font-medium ${getAccuracyColor(item.accuracy)}`}>
                    {item.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">
                Precisão média da IA: 89.5% (↑2.3% esta semana)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo Diário com Insights IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">R$ 2.845,60</div>
              <div className="text-sm text-muted-foreground">Lucro Total Hoje</div>
              <div className="text-xs text-green-600 mt-1">+12.3% vs ontem</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">89.5%</div>
              <div className="text-sm text-muted-foreground">Precisão IA Média</div>
              <div className="text-xs text-blue-600 mt-1">Melhorando consistentemente</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-muted-foreground">Oportunidades IA</div>
              <div className="text-xs text-purple-600 mt-1">Potencial +R$ 320</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Insight Principal do Dia</h4>
            <p className="text-sm text-blue-800">
              A IA detectou que produtos de folhas verdes estão vendendo 30% mais rápido que o previsto. 
              Recomendação: aumentar pedidos de alface e similares para segunda-feira.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

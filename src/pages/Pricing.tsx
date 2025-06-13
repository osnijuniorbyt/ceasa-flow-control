
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Calculator, 
  Upload,
  Download,
  AlertTriangle,
  Target
} from "lucide-react";
import { QuickPricingTable } from "@/components/pricing/QuickPricingTable";
import { StrategicAnalysis } from "@/components/pricing/StrategicAnalysis";
import { MarginSimulator } from "@/components/pricing/MarginSimulator";
import { BulkPriceUpdater } from "@/components/pricing/BulkPriceUpdater";

export default function Pricing() {
  const [activeTab, setActiveTab] = useState("quick");

  const pricingMetrics = {
    avgMargin: 42.5,
    totalRevenue: 15420.80,
    priceUpdates: 23,
    criticalItems: 5
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Preços</h2>
          <p className="text-muted-foreground">
            Controle estratégico de precificação CEASA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Importar Preços
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pricingMetrics.avgMargin}%</div>
            <p className="text-xs text-green-600">+2.1% vs ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Diária</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {pricingMetrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-green-600">+8.3% vs ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atualizações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pricingMetrics.priceUpdates}</div>
            <p className="text-xs text-blue-600">Hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pricingMetrics.criticalItems}</div>
            <p className="text-xs text-red-600">Ação necessária</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick">Atualização Rápida</TabsTrigger>
          <TabsTrigger value="analysis">Análise Estratégica</TabsTrigger>
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
          <TabsTrigger value="bulk">Atualização em Lote</TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <QuickPricingTable />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <StrategicAnalysis />
        </TabsContent>

        <TabsContent value="simulator" className="space-y-4">
          <MarginSimulator />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <BulkPriceUpdater />
        </TabsContent>
      </Tabs>
    </div>
  );
}

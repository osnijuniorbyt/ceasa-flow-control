
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Target, Plus, Eye } from "lucide-react";
import { StockOverviewCard } from "@/components/commercial/StockOverviewCard";
import { AIOrderSuggestions } from "@/components/commercial/AIOrderSuggestions";
import { PricingRecommendations } from "@/components/commercial/PricingRecommendations";
import { AIInsightsPanel } from "@/components/commercial/AIInsightsPanel";
import { PredictiveAnalytics } from "@/components/commercial/PredictiveAnalytics";
import { CommercialMetrics } from "@/components/commercial/CommercialMetrics";

export default function Commercial() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'pricing' | 'analytics'>('dashboard');

  const dailyMetrics = {
    totalProfit: 2845.60,
    marginImprovement: 12.3,
    aiAccuracy: 87.5,
    activeInsights: 8
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Central Comercial IA
          </h2>
          <p className="text-muted-foreground">
            Hub inteligente de decisões comerciais com IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Relatórios
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido IA
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Diário</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {dailyMetrics.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-green-600">
              +{dailyMetrics.marginImprovement}% margem vs ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisão IA</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyMetrics.aiAccuracy}%</div>
            <p className="text-xs text-green-600">
              +2.1% esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insights Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyMetrics.activeInsights}</div>
            <p className="text-xs text-yellow-600">
              3 críticos, 5 normais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-blue-600">
              Potencial +R$ 320
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { key: 'dashboard', label: 'Visão Geral' },
          { key: 'orders', label: 'Pedidos IA' },
          { key: 'pricing', label: 'Precificação' },
          { key: 'analytics', label: 'Preditiva' }
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.key as any)}
            className="flex-1"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="grid gap-6 md:grid-cols-2">
          <StockOverviewCard />
          <AIInsightsPanel />
        </div>
      )}

      {activeTab === 'orders' && <AIOrderSuggestions />}
      {activeTab === 'pricing' && <PricingRecommendations />}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <PredictiveAnalytics />
          <CommercialMetrics />
        </div>
      )}
    </div>
  );
}


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  Bot, 
  AlertTriangle, 
  MessageSquare, 
  Package,
  TrendingDown,
  DollarSign,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutomationRule {
  id: string;
  name: string;
  type: "product_deactivation" | "low_stock" | "margin_warning" | "whatsapp_notification";
  isActive: boolean;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  lastTriggered?: string;
  triggeredCount: number;
}

export default function AutomationRules() {
  const { toast } = useToast();
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: "rule_001",
      name: "Auto-desativar produtos inativos",
      type: "product_deactivation",
      isActive: true,
      conditions: { inactiveDays: 15 },
      actions: { deactivate: true, notify: true },
      lastTriggered: "2024-01-15",
      triggeredCount: 12
    },
    {
      id: "rule_002",
      name: "Alerta de estoque baixo",
      type: "low_stock",
      isActive: true,
      conditions: { threshold: "minStock", percentage: 50 },
      actions: { email: true, whatsapp: true },
      lastTriggered: "2024-01-16",
      triggeredCount: 8
    },
    {
      id: "rule_003",
      name: "Aviso de margem baixa",
      type: "margin_warning",
      isActive: true,
      conditions: { marginThreshold: 20 },
      actions: { notify: true, highlight: true },
      lastTriggered: "2024-01-14",
      triggeredCount: 5
    },
    {
      id: "rule_004",
      name: "Notificações WhatsApp",
      type: "whatsapp_notification",
      isActive: false,
      conditions: { events: ["low_stock", "new_order", "critical_alert"] },
      actions: { whatsappNumber: "+5511999999999" },
      triggeredCount: 0
    }
  ]);

  const [whatsappConfig, setWhatsappConfig] = useState({
    apiKey: "",
    phoneNumber: "+5511999999999",
    isConfigured: false
  });

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
    
    toast({
      title: "Regra atualizada",
      description: "A regra de automação foi atualizada com sucesso.",
    });
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case "product_deactivation":
        return <Package className="h-4 w-4" />;
      case "low_stock":
        return <AlertTriangle className="h-4 w-4" />;
      case "margin_warning":
        return <DollarSign className="h-4 w-4" />;
      case "whatsapp_notification":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getRuleTypeLabel = (type: string) => {
    switch (type) {
      case "product_deactivation":
        return "Desativação de Produto";
      case "low_stock":
        return "Estoque Baixo";
      case "margin_warning":
        return "Aviso de Margem";
      case "whatsapp_notification":
        return "WhatsApp";
      default:
        return "Automação";
    }
  };

  const getStatusBadge = (rule: AutomationRule) => {
    if (!rule.isActive) {
      return <Badge variant="outline">Inativo</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
  };

  const configureWhatsApp = () => {
    if (whatsappConfig.apiKey && whatsappConfig.phoneNumber) {
      setWhatsappConfig(prev => ({ ...prev, isConfigured: true }));
      toast({
        title: "WhatsApp configurado",
        description: "As notificações WhatsApp foram configuradas com sucesso.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Preencha todos os campos para configurar o WhatsApp.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Regras de Automação</h2>
          <p className="text-muted-foreground">
            Configure automações para otimizar a gestão do seu negócio
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.filter(r => r.isActive).length}</div>
            <p className="text-xs text-muted-foreground">de {rules.length} regras</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acionamentos Hoje</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-green-600">+12% vs ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Desativados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Últimos 15 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {whatsappConfig.isConfigured ? "✓" : "✗"}
            </div>
            <p className="text-xs text-muted-foreground">
              {whatsappConfig.isConfigured ? "Configurado" : "Não configurado"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp Configuration */}
      {!whatsappConfig.isConfigured && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <MessageSquare className="h-5 w-5" />
              Configurar WhatsApp
            </CardTitle>
            <p className="text-sm text-orange-700">
              Configure sua API do WhatsApp para receber notificações automáticas
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="whatsapp-api">Chave da API WhatsApp</Label>
                <Input
                  id="whatsapp-api"
                  type="password"
                  placeholder="Sua chave da API"
                  value={whatsappConfig.apiKey}
                  onChange={(e) => setWhatsappConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="whatsapp-phone">Número do WhatsApp</Label>
                <Input
                  id="whatsapp-phone"
                  placeholder="+5511999999999"
                  value={whatsappConfig.phoneNumber}
                  onChange={(e) => setWhatsappConfig(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
              </div>
            </div>
            <Button onClick={configureWhatsApp} className="w-full">
              Configurar WhatsApp
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Automation Rules List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Regras Configuradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRuleIcon(rule.type)}
                    <div>
                      <h4 className="font-semibold">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {getRuleTypeLabel(rule.type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(rule)}
                    <Badge variant="outline">
                      {rule.triggeredCount} acionamentos
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {rule.lastTriggered && (
                    <div className="text-sm text-muted-foreground">
                      Último: {rule.lastTriggered}
                    </div>
                  )}
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rule Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes das Regras</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Auto-desativação de Produtos</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Produtos sem movimentação há 15 dias são automaticamente desativados
              </p>
              <div className="text-xs space-y-1">
                <div>• Verifica produtos sem venda há 15+ dias</div>
                <div>• Desativa automaticamente</div>
                <div>• Envia notificação por email</div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Alertas de Estoque Baixo</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Notifica quando produtos atingem 50% do estoque mínimo
              </p>
              <div className="text-xs space-y-1">
                <div>• Monitora níveis de estoque</div>
                <div>• Alerta por email e WhatsApp</div>
                <div>• Sugere quantidade de reposição</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações Avançadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Avisos de Margem</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Alerta quando margem de produtos fica abaixo de 20%
              </p>
              <div className="text-xs space-y-1">
                <div>• Monitora margens de lucro</div>
                <div>• Destaca produtos críticos</div>
                <div>• Sugere ajustes de preço</div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Notificações WhatsApp</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Receba alertas importantes diretamente no WhatsApp
              </p>
              <div className="text-xs space-y-1">
                <div>• Alertas críticos em tempo real</div>
                <div>• Resumos diários de vendas</div>
                <div>• Confirmações de pedidos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

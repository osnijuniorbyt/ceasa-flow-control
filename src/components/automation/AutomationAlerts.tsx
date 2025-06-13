
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Bot, 
  Package, 
  DollarSign, 
  MessageSquare,
  X,
  Settings
} from "lucide-react";
import { automationService } from "@/services/automationService";

interface AutomationAlert {
  id: string;
  type: "low_stock" | "margin_warning" | "product_deactivated" | "system";
  title: string;
  message: string;
  severity: "info" | "warning" | "error";
  timestamp: string;
  productId?: string;
  dismissed: boolean;
}

export function AutomationAlerts() {
  const [alerts, setAlerts] = useState<AutomationAlert[]>([
    {
      id: "alert_001",
      type: "low_stock",
      title: "Estoque Baixo",
      message: "3 produtos com estoque crítico precisam de reposição",
      severity: "warning",
      timestamp: "2024-01-16T10:30:00Z",
      dismissed: false
    },
    {
      id: "alert_002",
      type: "margin_warning",
      title: "Margem Baixa",
      message: "Produto 'Alface hidropônica' com margem de 15% (abaixo de 20%)",
      severity: "warning",
      timestamp: "2024-01-16T09:15:00Z",
      productId: "P001",
      dismissed: false
    },
    {
      id: "alert_003",
      type: "product_deactivated",
      title: "Produto Desativado",
      message: "2 produtos foram desativados por inatividade",
      severity: "info",
      timestamp: "2024-01-16T08:00:00Z",
      dismissed: false
    }
  ]);

  const [automationStats, setAutomationStats] = useState({
    activeRules: 3,
    todayTriggers: 12,
    whatsappConfigured: false
  });

  useEffect(() => {
    // Load automation stats
    const rules = automationService.getRules();
    setAutomationStats({
      activeRules: rules.filter(r => r.isActive).length,
      todayTriggers: rules.reduce((sum, r) => sum + r.triggeredCount, 0),
      whatsappConfigured: false // This would come from the service
    });
  }, []);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, dismissed: true }
        : alert
    ));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "low_stock":
        return <Package className="h-4 w-4" />;
      case "margin_warning":
        return <DollarSign className="h-4 w-4" />;
      case "product_deactivated":
        return <Package className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "error":
        return "destructive";
      case "warning":
        return "default";
      default:
        return "default";
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);

  if (activeAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Automação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Bot className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum alerta de automação no momento
            </p>
            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
              <div className="text-center">
                <div className="font-bold">{automationStats.activeRules}</div>
                <div className="text-muted-foreground">Regras Ativas</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{automationStats.todayTriggers}</div>
                <div className="text-muted-foreground">Acionamentos</div>
              </div>
              <div className="text-center">
                <div className="font-bold">
                  {automationStats.whatsappConfigured ? "✓" : "✗"}
                </div>
                <div className="text-muted-foreground">WhatsApp</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Alertas de Automação
            <Badge className="bg-orange-100 text-orange-800">
              {activeAlerts.length}
            </Badge>
          </CardTitle>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeAlerts.slice(0, 3).map((alert) => (
            <Alert key={alert.id} variant={getSeverityVariant(alert.severity)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      {alert.message}
                    </AlertDescription>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </Alert>
          ))}

          {activeAlerts.length > 3 && (
            <div className="text-center pt-2">
              <Button variant="outline" size="sm">
                Ver todos ({activeAlerts.length} alertas)
              </Button>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t text-sm">
            <div className="text-center">
              <div className="font-bold">{automationStats.activeRules}</div>
              <div className="text-muted-foreground">Regras Ativas</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{automationStats.todayTriggers}</div>
              <div className="text-muted-foreground">Hoje</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">
                {automationStats.whatsappConfigured ? "✓" : "✗"}
              </div>
              <div className="text-muted-foreground">WhatsApp</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

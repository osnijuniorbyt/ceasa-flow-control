import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, DollarSign, X } from "lucide-react";
import { PurchaseService } from "@/services/purchaseService";
import { PurchaseOrder } from "@/types/compras";
import { FastCheckoutProduct } from "@/types/fastCheckout";

interface Notification {
  id: string;
  type: "stock_critical" | "stock_low" | "payment_overdue" | "payment_due_soon";
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  data: any;
}

export function PurchaseNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = [];
      
      // Stock notifications
      const products = PurchaseService.getProducts();
      const criticalProducts = products.filter(p => p.stockLevel === "critical");
      const lowStockProducts = products.filter(p => p.stockLevel === "low");
      
      if (criticalProducts.length > 0) {
        newNotifications.push({
          id: "stock_critical",
          type: "stock_critical",
          title: "Estoque Crítico",
          message: `${criticalProducts.length} produto(s) com estoque crítico: ${criticalProducts.slice(0, 3).map(p => p.name).join(", ")}${criticalProducts.length > 3 ? "..." : ""}`,
          priority: "high",
          data: criticalProducts
        });
      }
      
      if (lowStockProducts.length > 0) {
        newNotifications.push({
          id: "stock_low",
          type: "stock_low",
          title: "Estoque Baixo",
          message: `${lowStockProducts.length} produto(s) com estoque baixo precisam de atenção`,
          priority: "medium",
          data: lowStockProducts
        });
      }
      
      // Payment notifications
      const orders = PurchaseService.getPurchaseOrders();
      const overdueOrders = orders.filter(o => !o.isPaid && getDaysUntilDue(o.dueDate) < 0);
      const dueSoonOrders = orders.filter(o => !o.isPaid && getDaysUntilDue(o.dueDate) >= 0 && getDaysUntilDue(o.dueDate) <= 3);
      
      if (overdueOrders.length > 0) {
        newNotifications.push({
          id: "payment_overdue",
          type: "payment_overdue",
          title: "Pagamentos Vencidos",
          message: `${overdueOrders.length} pagamento(s) em atraso. Total: R$ ${overdueOrders.reduce((sum, o) => sum + o.totalValue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          priority: "high",
          data: overdueOrders
        });
      }
      
      if (dueSoonOrders.length > 0) {
        newNotifications.push({
          id: "payment_due_soon",
          type: "payment_due_soon",
          title: "Pagamentos Próximos do Vencimento",
          message: `${dueSoonOrders.length} pagamento(s) vencem em até 3 dias`,
          priority: "medium",
          data: dueSoonOrders
        });
      }
      
      setNotifications(newNotifications);
    };
    
    generateNotifications();
    
    // Update notifications every 30 seconds
    const interval = setInterval(generateNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleDismiss = (notificationId: string) => {
    const newDismissed = new Set(dismissed);
    newDismissed.add(notificationId);
    setDismissed(newDismissed);
  };

  const getAlertVariant = (priority: string) => {
    return priority === "high" ? "destructive" : "default";
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "stock_critical":
      case "stock_low":
        return <AlertTriangle className="h-4 w-4" />;
      case "payment_overdue":
        return <DollarSign className="h-4 w-4" />;
      case "payment_due_soon":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const visibleNotifications = notifications.filter(n => !dismissed.has(n.id));

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      {visibleNotifications.map((notification) => (
        <Alert key={notification.id} variant={getAlertVariant(notification.priority)}>
          <div className="flex items-start gap-3 w-full">
            {getIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{notification.title}</span>
                <Badge 
                  variant={notification.priority === "high" ? "destructive" : "secondary"}
                  className="text-xs px-1.5 py-0.5"
                >
                  {notification.priority === "high" ? "Alta" : 
                   notification.priority === "medium" ? "Média" : "Baixa"}
                </Badge>
              </div>
              <AlertDescription className="text-xs">
                {notification.message}
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss(notification.id)}
              className="h-6 w-6 p-0 hover:bg-transparent"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
}
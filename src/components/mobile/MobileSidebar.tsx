
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Warehouse,
  Package,
  BarChart3,
  Settings,
  Truck,
  Brain,
  DollarSign,
  CreditCard,
  Zap,
  X
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    badge: null
  },
  {
    title: "Controle de Pagamentos",
    url: "/compras",
    icon: CreditCard,
    badge: "3"
  },
  {
    title: "Compras Rápidas",
    url: "/purchase-orders",
    icon: Zap,
    badge: null
  },
  {
    title: "Portal do Comprador",
    url: "/buyer-portal",
    icon: Users,
    badge: null
  },
  {
    title: "Depósito",
    url: "/warehouse",
    icon: Warehouse,
    badge: "2"
  },
  {
    title: "Inventário",
    url: "/inventory",
    icon: Package,
    badge: null
  },
  {
    title: "Central Comercial IA",
    url: "/commercial",
    icon: Brain,
    badge: "NEW"
  },
  {
    title: "Gestão de Preços",
    url: "/pricing",
    icon: DollarSign,
    badge: null
  },
  {
    title: "Entregas",
    url: "/deliveries",
    icon: Truck,
    badge: "5"
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: BarChart3,
    badge: null
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
    badge: null
  },
];

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const location = useLocation();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <SheetTitle className="text-xl">CEASA Mobile</SheetTitle>
                <p className="text-sm text-muted-foreground">Sistema de Controle</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                onClick={onClose}
                className={`flex items-center gap-4 p-4 rounded-lg transition-colors touch-manipulation ${
                  location.pathname === item.url
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'hover:bg-muted'
                }`}
              >
                <item.icon className="h-6 w-6 flex-shrink-0" />
                <span className="flex-1 font-medium">{item.title}</span>
                {item.badge && (
                  <Badge 
                    variant={item.badge === "NEW" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="p-4 border-t bg-muted/30">
          <div className="text-center text-sm text-muted-foreground">
            <p>CEASA Mobile v2.0</p>
            <p>Otimizado para dispositivos móveis</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

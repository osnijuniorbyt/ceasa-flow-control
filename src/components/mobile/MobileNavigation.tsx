
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Warehouse, 
  BarChart3,
  DollarSign,
  Bolt
} from "lucide-react";
import { cn } from "@/lib/utils";

const quickNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "⚡ Rápida",
    url: "/compra-rapida",
    icon: Bolt,
  },
  {
    title: "Depósito",
    url: "/warehouse",
    icon: Warehouse,
  },
  {
    title: "Preços",
    url: "/pricing",
    icon: DollarSign,
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: BarChart3,
  },
];

export function MobileNavigation() {
  const location = useLocation();

  return (
    <nav className="sticky bottom-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="flex items-center justify-around h-20 px-2 safe-area-inset-bottom">
        {quickNavItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 touch-manipulation transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-6 w-6 mb-1", isActive && "scale-110")} />
              <span className="text-xs font-medium truncate">{item.title}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

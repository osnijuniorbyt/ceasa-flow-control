
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
    title: "⚡ CEASA",
    url: "/compras-ceasa",
    icon: Bolt,
  },
  {
    title: "Compras",
    url: "/compras",
    icon: ShoppingCart,
  },
  {
    title: "Depósito",
    url: "/warehouse",
    icon: Warehouse,
  },
  {
    title: "Cadastros",
    url: "/cadastros",
    icon: LayoutDashboard,
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-16 px-1">
        {quickNavItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 touch-manipulation transition-colors relative",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-0.5", isActive && "scale-110")} />
              <span className="text-[10px] font-medium truncate max-w-full">{item.title}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

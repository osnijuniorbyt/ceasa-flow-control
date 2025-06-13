
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
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
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Controle de Pagamentos",
    url: "/compras",
    icon: CreditCard,
  },
  {
    title: "Pedidos de Compra",
    url: "/purchase-orders",
    icon: ShoppingCart,
  },
  {
    title: "Portal do Comprador",
    url: "/buyer-portal",
    icon: Users,
  },
  {
    title: "Depósito",
    url: "/warehouse",
    icon: Warehouse,
  },
  {
    title: "Inventário",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "Central Comercial IA",
    url: "/commercial",
    icon: Brain,
  },
  {
    title: "Gestão de Preços",
    url: "/pricing",
    icon: DollarSign,
  },
  {
    title: "Entregas",
    url: "/deliveries",
    icon: Truck,
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">CEASA</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

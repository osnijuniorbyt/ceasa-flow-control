
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import PurchaseOrders from "./pages/PurchaseOrders";
import BuyerPortal from "./pages/BuyerPortal";
import Warehouse from "./pages/Warehouse";
import WarehouseReceiving from "./pages/WarehouseReceiving";
import Inventory from "./pages/Inventory";
import ProductManagement from "./pages/ProductManagement";
import Commercial from "./pages/Commercial";
import Pricing from "./pages/Pricing";
import AutomationRules from "./pages/AutomationRules";
import Deliveries from "./pages/Deliveries";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="buyer-portal" element={<BuyerPortal />} />
            <Route path="warehouse" element={<Warehouse />} />
            <Route path="warehouse/receiving" element={<WarehouseReceiving />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="product-management" element={<ProductManagement />} />
            <Route path="commercial" element={<Commercial />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="automation-rules" element={<AutomationRules />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

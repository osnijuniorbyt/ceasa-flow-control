
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Compras from "./pages/Compras";
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
import Categories from "./pages/Categories";
import ProductImport from "./pages/ProductImport";
import ComprasCeasa from "./pages/ComprasCeasa";
import Fornecedores from "./pages/Fornecedores";
import CompraRapida from "./pages/CompraRapida";
import Produtos from "./pages/Produtos";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Add mobile viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }

    // Add mobile-specific meta tags
    const appleMeta = document.createElement('meta');
    appleMeta.name = 'apple-mobile-web-app-capable';
    appleMeta.content = 'yes';
    document.getElementsByTagName('head')[0].appendChild(appleMeta);

    const appleStatusBar = document.createElement('meta');
    appleStatusBar.name = 'apple-mobile-web-app-status-bar-style';
    appleStatusBar.content = 'black-translucent';
    document.getElementsByTagName('head')[0].appendChild(appleStatusBar);

    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
                  <Route index element={<Dashboard />} />
                <Route path="compras" element={<Compras />} />
                <Route path="purchase-orders" element={<PurchaseOrders />} />
                <Route path="buyer-portal" element={<BuyerPortal />} />
                <Route path="warehouse" element={<Warehouse />} />
                <Route path="warehouse/receiving" element={<WarehouseReceiving />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="product-management" element={<ProductManagement />} />
                <Route path="categories" element={<Categories />} />
                <Route path="fornecedores" element={<Fornecedores />} />
                <Route path="produtos" element={<Produtos />} />
                <Route path="product-import" element={<ProductImport />} />
                <Route path="compras-ceasa" element={<ComprasCeasa />} />
                <Route path="compra-rapida" element={<CompraRapida />} />
                <Route path="commercial" element={<Commercial />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="automation-rules" element={<AutomationRules />} />
                <Route path="deliveries" element={<Deliveries />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

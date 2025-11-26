
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileNavigation } from "./MobileNavigation";
import { MobileSidebar } from "./MobileSidebar";
import { SwipeHandler } from "./SwipeHandler";
import { OfflineIndicator } from "./OfflineIndicator";
import { cn } from "@/lib/utils";

export function MobileLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <MobileHeader 
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <OfflineIndicator isVisible={!isOnline} />
        
        <SwipeHandler 
          onSwipeRight={() => setSidebarOpen(true)}
          onSwipeLeft={() => setSidebarOpen(false)}
        >
          <main className="flex-1 overflow-auto pb-16" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
            <div className="w-full h-full">
              <Outlet />
            </div>
          </main>
        </SwipeHandler>

        <MobileNavigation />
        
        <MobileSidebar 
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
    </SidebarProvider>
  );
}

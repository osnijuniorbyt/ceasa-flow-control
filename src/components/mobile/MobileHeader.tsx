
import { Package, Menu, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobileHeaderProps {
  onMenuClick: () => void;
  isOnline: boolean;
}

export function MobileHeader({ onMenuClick, isOnline }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex h-16 items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-12 w-12 touch-manipulation"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <span className="font-bold text-lg">HORTECH</span>
            <span className="text-xs text-muted-foreground">Mobile</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
          <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
      </div>
    </header>
  );
}

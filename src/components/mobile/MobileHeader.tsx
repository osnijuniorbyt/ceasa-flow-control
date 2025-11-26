import { Package, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { signOut, user } = useAuth();
  
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
            <span className="font-bold text-lg">CEASA</span>
            <span className="text-xs text-muted-foreground">Mobile</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {user?.email?.split('@')[0]}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="h-10 w-10"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

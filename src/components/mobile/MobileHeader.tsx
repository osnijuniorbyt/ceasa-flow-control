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
      <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-12 w-12 md:h-14 md:w-14 touch-manipulation"
        >
          <Menu className="h-6 w-6 md:h-7 md:w-7" />
        </Button>
        
        <div className="flex items-center gap-3 md:gap-4">
          <Package className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          <div className="flex flex-col">
            <span className="font-bold text-lg md:text-xl">CEASA</span>
            <span className="text-xs md:text-sm text-muted-foreground">Mobile</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">
            {user?.email?.split('@')[0]}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="h-10 w-10 md:h-12 md:w-12"
            title="Sair"
          >
            <LogOut className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

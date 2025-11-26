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
      <div className="flex h-20 md:h-24 items-center justify-between px-6 md:px-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-14 w-14 md:h-16 md:w-16 touch-manipulation"
        >
          <Menu className="h-8 w-8 md:h-9 md:w-9" />
        </Button>
        
        <div className="flex items-center gap-4 md:gap-5">
          <Package className="h-10 w-10 md:h-12 md:w-12 text-primary" />
          <div className="flex flex-col">
            <span className="font-bold text-xl md:text-2xl">CEASA</span>
            <span className="text-sm md:text-base text-muted-foreground">Mobile</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm md:text-base text-muted-foreground hidden sm:inline">
            {user?.email?.split('@')[0]}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="h-12 w-12 md:h-14 md:w-14"
            title="Sair"
          >
            <LogOut className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}


import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  isVisible: boolean;
}

export function OfflineIndicator({ isVisible }: OfflineIndicatorProps) {
  return (
    <div className={cn(
      "transition-all duration-300 overflow-hidden",
      isVisible ? "max-h-20" : "max-h-0"
    )}>
      <Alert className="rounded-none border-l-0 border-r-0 bg-destructive/10 border-destructive/20">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Você está offline. Algumas funcionalidades podem estar limitadas.
        </AlertDescription>
      </Alert>
    </div>
  );
}

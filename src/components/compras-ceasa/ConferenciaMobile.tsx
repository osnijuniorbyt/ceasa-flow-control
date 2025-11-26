import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export function ConferenciaMobile() {
  return (
    <div className="space-y-3 p-2">
      <Card>
        <CardHeader className="pb-3 pt-4 px-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="h-5 w-5" />
            Conferência de Compras
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="text-center py-8 text-muted-foreground">
            <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Funcionalidade em desenvolvimento</p>
            <p className="text-xs mt-1">Em breve você poderá conferir e validar suas compras aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

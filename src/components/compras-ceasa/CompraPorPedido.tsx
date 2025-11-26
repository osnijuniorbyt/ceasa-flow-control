import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function CompraPorPedido() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Compra por Pedido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Funcionalidade em desenvolvimento</p>
          <p className="text-sm mt-2">
            Em breve você poderá criar pedidos planejados com acompanhamento de status
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

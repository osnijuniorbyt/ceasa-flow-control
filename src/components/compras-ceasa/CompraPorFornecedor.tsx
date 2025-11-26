import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function CompraPorFornecedor() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Compra por Fornecedor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Funcionalidade em desenvolvimento</p>
          <p className="text-sm mt-2">
            Em breve você poderá visualizar histórico e criar compras consolidadas por fornecedor
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

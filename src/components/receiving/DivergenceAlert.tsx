
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, X } from "lucide-react";
import { ProductReceiving } from "@/types/receiving";

interface DivergenceAlertProps {
  product: ProductReceiving;
  onClose: () => void;
}

export function DivergenceAlert({ product, onClose }: DivergenceAlertProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Alerta de Divergência
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="font-medium text-red-800 mb-1">
              Produto: {product.name}
            </div>
            <div className="text-sm text-red-700">
              Foi detectada uma divergência significativa entre os valores esperados e os conferidos.
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-red-100 text-red-800">
              Requer atenção do supervisor
            </Badge>
            <Badge variant="outline" className="border-red-300 text-red-700">
              Registro automático criado
            </Badge>
          </div>

          <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
            <strong>Ação necessária:</strong> Este produto deve ser revisado pelo supervisor 
            antes de ser encaminhado ao estoque. O registro de divergência foi salvo automaticamente.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

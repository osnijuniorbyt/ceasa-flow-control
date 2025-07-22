import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DataStorage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Armazenamento de Dados</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Modo Demonstração</AlertTitle>
          <AlertDescription>
            Nesta versão de demonstração, todos os dados (produtos, pedidos e fornecedores) 
            estão sendo armazenados localmente no seu navegador usando localStorage. 
            Estes dados persistirão entre sessões no mesmo dispositivo, mas não são 
            sincronizados com um servidor ou entre dispositivos diferentes.
          </AlertDescription>
        </Alert>
        
        <div className="mt-4 text-sm">
          <p className="mb-2">Onde os dados são armazenados:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Produtos:</strong> Todos os produtos, incluindo os novos adicionados, são salvos no localStorage.</li>
            <li><strong>Pedidos:</strong> Os pedidos confirmados são salvos no localStorage e podem ser visualizados na aba "Histórico de Pedidos".</li>
            <li><strong>Fornecedores:</strong> Os dados dos fornecedores também são mantidos no localStorage.</li>
          </ul>
          <p className="mt-3">
            Em uma versão de produção, estes dados seriam armazenados em um banco de dados
            seguro com sincronização em nuvem e backup automático.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
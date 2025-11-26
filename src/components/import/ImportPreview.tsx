import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

interface ImportPreviewProps {
  data: any[];
  headers: string[];
  onContinue: () => void;
  onBack: () => void;
}

export function ImportPreview({ data, headers, onContinue, onBack }: ImportPreviewProps) {
  const previewRows = data.slice(0, 5);

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          <strong>{data.length} linhas</strong> encontradas. Visualizando as primeiras 5 linhas.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Preview dos Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">#</th>
                  {headers.map((header, index) => (
                    <th key={index} className="text-left p-2 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b hover:bg-muted/50">
                    <td className="p-2 text-muted-foreground">{rowIndex + 1}</td>
                    {headers.map((header, colIndex) => (
                      <td key={colIndex} className="p-2">
                        {row[header] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.length > 5 && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              ... e mais {data.length - 5} linhas
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={onContinue}>
          Continuar para Mapeamento
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

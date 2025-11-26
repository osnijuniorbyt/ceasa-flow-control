import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";

interface ImportMappingProps {
  headers: string[];
  onStartImport: (mapping: Record<string, string>) => void;
  onBack: () => void;
}

const SYSTEM_FIELDS = [
  { value: "codigo", label: "Código", required: true },
  { value: "descricao", label: "Nome/Descrição", required: true },
  { value: "categoria", label: "Categoria", required: false },
  { value: "unidade", label: "Unidade", required: false },
  { value: "preco", label: "Preço", required: false },
  { value: "margem", label: "Margem (%)", required: false },
  { value: "ignore", label: "Ignorar", required: false },
];

export function ImportMapping({ headers, onStartImport, onBack }: ImportMappingProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Auto-mapeamento inteligente
    const autoMapping: Record<string, string> = {};
    
    headers.forEach((header) => {
      const headerLower = header.toLowerCase().trim();
      
      if (headerLower.includes("codigo") || headerLower.includes("cod")) {
        autoMapping[header] = "codigo";
      } else if (headerLower.includes("descri") || headerLower.includes("nome") || headerLower.includes("produto")) {
        autoMapping[header] = "descricao";
      } else if (headerLower.includes("categ") || headerLower.includes("grupo")) {
        autoMapping[header] = "categoria";
      } else if (headerLower.includes("unid") || headerLower.includes("un")) {
        autoMapping[header] = "unidade";
      } else if (headerLower.includes("preco") || headerLower.includes("valor")) {
        autoMapping[header] = "preco";
      } else if (headerLower.includes("margem")) {
        autoMapping[header] = "margem";
      } else {
        autoMapping[header] = "ignore";
      }
    });

    setMapping(autoMapping);
  }, [headers]);

  const handleMapping = (header: string, value: string) => {
    setMapping({ ...mapping, [header]: value });
  };

  const validateMapping = () => {
    const newErrors: string[] = [];
    
    const requiredFields = SYSTEM_FIELDS.filter(f => f.required);
    requiredFields.forEach((field) => {
      const isMapped = Object.values(mapping).includes(field.value);
      if (!isMapped) {
        newErrors.push(`Campo obrigatório "${field.label}" não está mapeado`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleContinue = () => {
    if (validateMapping()) {
      onStartImport(mapping);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Mapeie as colunas do seu arquivo para os campos do sistema. Campos marcados com * são obrigatórios.
        </AlertDescription>
      </Alert>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Mapeamento de Colunas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {headers.map((header) => (
            <div key={header} className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium">{header}</Label>
                <p className="text-xs text-muted-foreground">Coluna do arquivo</p>
              </div>
              
              <div className="text-muted-foreground">→</div>
              
              <div className="flex-1">
                <Select
                  value={mapping[header] || "ignore"}
                  onValueChange={(value) => handleMapping(header, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEM_FIELDS.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label} {field.required && "*"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleContinue}>
          Iniciar Importação
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

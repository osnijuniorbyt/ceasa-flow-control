import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { ImportUpload } from "@/components/import/ImportUpload";
import { ImportPreview } from "@/components/import/ImportPreview";
import { ImportMapping } from "@/components/import/ImportMapping";
import { ImportResults } from "@/components/import/ImportResults";

export type ImportStep = "upload" | "preview" | "mapping" | "importing" | "results";

export interface ImportResult {
  success: number;
  errors: Array<{ linha: number; erro: string }>;
}

export default function ImportarProdutos() {
  const [step, setStep] = useState<ImportStep>("upload");
  const [fileData, setFileData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileLoaded = (data: any[], headers: string[]) => {
    setFileData(data);
    setHeaders(headers);
    setStep("preview");
  };

  const handleContinueToMapping = () => {
    setStep("mapping");
  };

  const handleStartImport = (fieldMapping: Record<string, string>) => {
    setMapping(fieldMapping);
    setStep("importing");
    // A importação acontece no componente ImportResults
  };

  const handleImportComplete = (result: ImportResult) => {
    setResult(result);
    setStep("results");
  };

  const handleReset = () => {
    setStep("upload");
    setFileData([]);
    setHeaders([]);
    setMapping({});
    setResult(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileSpreadsheet className="h-8 w-8 text-primary" />
          Importar Produtos
        </h1>
        <p className="text-muted-foreground">Importe produtos em lote via CSV ou Excel</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <StepIndicator
            number={1}
            label="Upload"
            active={step === "upload"}
            complete={["preview", "mapping", "importing", "results"].includes(step)}
          />
          <div className="flex-1 h-0.5 bg-border" />
          <StepIndicator
            number={2}
            label="Preview"
            active={step === "preview"}
            complete={["mapping", "importing", "results"].includes(step)}
          />
          <div className="flex-1 h-0.5 bg-border" />
          <StepIndicator
            number={3}
            label="Mapeamento"
            active={step === "mapping"}
            complete={["importing", "results"].includes(step)}
          />
          <div className="flex-1 h-0.5 bg-border" />
          <StepIndicator
            number={4}
            label="Resultado"
            active={step === "importing" || step === "results"}
            complete={step === "results"}
          />
        </div>
      </div>

      {/* Content */}
      {step === "upload" && <ImportUpload onFileLoaded={handleFileLoaded} />}
      
      {step === "preview" && (
        <ImportPreview
          data={fileData}
          headers={headers}
          onContinue={handleContinueToMapping}
          onBack={handleReset}
        />
      )}
      
      {step === "mapping" && (
        <ImportMapping
          headers={headers}
          onStartImport={handleStartImport}
          onBack={() => setStep("preview")}
        />
      )}
      
      {(step === "importing" || step === "results") && (
        <ImportResults
          data={fileData}
          mapping={mapping}
          onComplete={handleImportComplete}
          onReset={handleReset}
          result={result}
        />
      )}
    </div>
  );
}

interface StepIndicatorProps {
  number: number;
  label: string;
  active: boolean;
  complete: boolean;
}

function StepIndicator({ number, label, active, complete }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
          complete
            ? "bg-primary text-primary-foreground"
            : active
            ? "bg-primary/20 text-primary border-2 border-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {complete ? <CheckCircle2 className="h-5 w-5" /> : number}
      </div>
      <span className="text-xs mt-2 font-medium">{label}</span>
    </div>
  );
}

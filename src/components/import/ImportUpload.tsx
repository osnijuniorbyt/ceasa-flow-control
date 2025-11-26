import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileSpreadsheet, AlertCircle, ClipboardPaste } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

interface ImportUploadProps {
  onFileLoaded: (data: any[], headers: string[]) => void;
}

export function ImportUpload({ onFileLoaded }: ImportUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension === "csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          delimiter: ";", // Detecta automaticamente mas prioriza ponto-e-vírgula
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              const headers = Object.keys(results.data[0]);
              onFileLoaded(results.data, headers);
            } else {
              toast({
                title: "Erro",
                description: "Arquivo CSV vazio",
                variant: "destructive",
              });
            }
            setLoading(false);
          },
          error: (error) => {
            toast({
              title: "Erro",
              description: `Erro ao ler CSV: ${error.message}`,
              variant: "destructive",
            });
            setLoading(false);
          },
        });
      } else if (["xlsx", "xls"].includes(fileExtension || "")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (jsonData.length < 2) {
              toast({
                title: "Erro",
                description: "Planilha vazia ou sem dados",
                variant: "destructive",
              });
              setLoading(false);
              return;
            }

            const headers = jsonData[0] as string[];
            const rows = jsonData.slice(1).map((row: any) => {
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = row[index];
              });
              return obj;
            });

            onFileLoaded(rows, headers);
            setLoading(false);
          } catch (error) {
            toast({
              title: "Erro",
              description: "Erro ao ler arquivo Excel",
              variant: "destructive",
            });
            setLoading(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast({
          title: "Formato inválido",
          description: "Apenas arquivos CSV, XLS ou XLSX são aceitos",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      toast({
        title: "Erro",
        description: "Erro ao processar arquivo",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handlePastedText = () => {
    if (!pastedText.trim()) {
      toast({
        title: "Erro",
        description: "Cole o conteúdo CSV na área de texto",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      Papa.parse(pastedText, {
        header: true,
        skipEmptyLines: true,
        delimiter: ";",
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const headers = Object.keys(results.data[0]);
            onFileLoaded(results.data, headers);
          } else {
            toast({
              title: "Erro",
              description: "Nenhum dado encontrado no texto colado",
              variant: "destructive",
            });
          }
          setLoading(false);
        },
        error: (error) => {
          toast({
            title: "Erro",
            description: `Erro ao processar CSV: ${error.message}`,
            variant: "destructive",
          });
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("Erro ao processar texto:", error);
      toast({
        title: "Erro",
        description: "Erro ao processar texto colado",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Arquivo
            </TabsTrigger>
            <TabsTrigger value="paste">
              <ClipboardPaste className="h-4 w-4 mr-2" />
              Colar CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              
              {loading ? (
                <p className="text-lg font-medium mb-2">Processando arquivo...</p>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">
                    Arraste e solte seu arquivo aqui
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    ou clique para selecionar
                  </p>

                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileInput}
                    disabled={loading}
                  />
                  <label htmlFor="file-upload">
                    <Button asChild disabled={loading}>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar Arquivo
                      </span>
                    </Button>
                  </label>

                  <p className="text-xs text-muted-foreground mt-4">
                    Formatos aceitos: CSV (;), XLS, XLSX
                  </p>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="paste" className="mt-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Cole aqui o conteúdo do CSV (separado por ponto-e-vírgula)
                </label>
                <Textarea
                  placeholder="CODIGO;DESCRICAO;SUBGRUPO;UNIDADE&#10;001;Maçã;FRUTAS;QUILO&#10;002;Alface;VERDURAS;UNIDADE"
                  className="min-h-[300px] font-mono text-sm"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <Button 
                onClick={handlePastedText} 
                disabled={loading || !pastedText.trim()}
                className="w-full"
              >
                {loading ? "Processando..." : "Processar CSV"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Formato esperado:</strong> CSV com separador ponto-e-vírgula (;) contendo as colunas CODIGO, DESCRICAO, SUBGRUPO e UNIDADE.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

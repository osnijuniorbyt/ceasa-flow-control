import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ImportLog {
  row: number;
  status: "success" | "error" | "warning";
  message: string;
  data?: any;
}

export default function ProductImport() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [logs, setLogs] = useState<ImportLog[]>([]);

  const { data: grupos } = useQuery({
    queryKey: ["grupos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grupos")
        .select("id, codigo, nome")
        .eq("ativo", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: subgrupos } = useQuery({
    queryKey: ["subgrupos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subgrupos")
        .select("id, codigo, nome, grupo_id")
        .eq("ativo", true);
      if (error) throw error;
      return data;
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
        setLogs([]);
      } else {
        toast.error("Formato inválido. Use CSV ou Excel (.xlsx, .xls)");
      }
    }
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split("\n").filter(line => line.trim());
    return lines.map(line => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  };

  const handleImport = async () => {
    if (!file || !grupos || !subgrupos) {
      toast.error("Selecione um arquivo válido");
      return;
    }

    setImporting(true);
    setLogs([]);
    const newLogs: ImportLog[] = [];

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length === 0) {
        toast.error("Arquivo vazio");
        setImporting(false);
        return;
      }

      // Header: codigo, descricao, grupo_codigo, subgrupo_codigo, unidade_venda, margem_padrao, referencia
      const header = rows[0].map(h => h.toLowerCase().trim());
      const requiredFields = ["codigo", "descricao", "grupo", "subgrupo", "unidade"];
      
      const missingFields = requiredFields.filter(field => 
        !header.some(h => h.includes(field))
      );
      
      if (missingFields.length > 0) {
        toast.error(`Colunas obrigatórias faltando: ${missingFields.join(", ")}`);
        setImporting(false);
        return;
      }

      // Process each row
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length === 0 || row.every(cell => !cell.trim())) continue;

        try {
          const codigo = row[header.indexOf(header.find(h => h.includes("codigo")) || "")]?.trim();
          const descricao = row[header.indexOf(header.find(h => h.includes("descricao")) || "")]?.trim();
          const grupoCodigo = parseInt(row[header.indexOf(header.find(h => h.includes("grupo") && !h.includes("subgrupo")) || "")]?.trim());
          const subgrupoCodigo = parseInt(row[header.indexOf(header.find(h => h.includes("subgrupo")) || "")]?.trim());
          const unidadeVenda = row[header.indexOf(header.find(h => h.includes("unidade")) || "")]?.trim();
          const margemPadrao = parseFloat(row[header.indexOf(header.find(h => h.includes("margem")) || "")]?.trim() || "0");
          const referencia = row[header.indexOf(header.find(h => h.includes("referencia")) || "")]?.trim();

          if (!codigo || !descricao) {
            newLogs.push({
              row: i + 1,
              status: "error",
              message: "Código e descrição são obrigatórios",
            });
            continue;
          }

          const grupo = grupos.find(g => g.codigo === grupoCodigo);
          const subgrupo = subgrupos.find(s => s.codigo === subgrupoCodigo && s.grupo_id === grupo?.id);

          if (!grupo) {
            newLogs.push({
              row: i + 1,
              status: "error",
              message: `Grupo ${grupoCodigo} não encontrado`,
              data: { codigo, descricao },
            });
            continue;
          }

          if (!subgrupo) {
            newLogs.push({
              row: i + 1,
              status: "error",
              message: `Subgrupo ${subgrupoCodigo} não encontrado no grupo ${grupoCodigo}`,
              data: { codigo, descricao },
            });
            continue;
          }

          // Insert product
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");
          
          const { error } = await supabase.from("produtos").insert({
            codigo,
            descricao,
            grupo_id: grupo.id,
            subgrupo_id: subgrupo.id,
            unidade_venda: unidadeVenda || "KG",
            margem_padrao: margemPadrao || null,
            referencia: referencia || null,
            user_id: user.id
          });

          if (error) {
            if (error.code === "23505") {
              newLogs.push({
                row: i + 1,
                status: "warning",
                message: `Produto ${codigo} já existe`,
                data: { codigo, descricao },
              });
            } else {
              newLogs.push({
                row: i + 1,
                status: "error",
                message: `Erro ao inserir: ${error.message}`,
                data: { codigo, descricao },
              });
            }
          } else {
            newLogs.push({
              row: i + 1,
              status: "success",
              message: `Produto ${codigo} importado com sucesso`,
              data: { codigo, descricao },
            });
          }
        } catch (err: any) {
          newLogs.push({
            row: i + 1,
            status: "error",
            message: `Erro: ${err.message}`,
          });
        }
      }

      setLogs(newLogs);
      const successCount = newLogs.filter(l => l.status === "success").length;
      const errorCount = newLogs.filter(l => l.status === "error").length;
      
      toast.success(`Importação concluída: ${successCount} produtos importados, ${errorCount} erros`);
    } catch (error: any) {
      toast.error(`Erro ao processar arquivo: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileSpreadsheet className="h-8 w-8 text-primary" />
          Importação de Produtos
        </h1>
        <p className="text-muted-foreground mt-1">
          Importe produtos em massa via CSV ou Excel
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formato do Arquivo</CardTitle>
          <CardDescription>
            O arquivo deve conter as seguintes colunas (nesta ordem ou com cabeçalho):
            <br />
            <strong>codigo, descricao, grupo, subgrupo, unidade, margem, referencia</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" asChild>
                <span className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivo
                </span>
              </Button>
            </label>
            {file && <span className="text-sm text-muted-foreground">{file.name}</span>}
          </div>

          {file && (
            <Button onClick={handleImport} disabled={importing} className="w-full">
              {importing ? "Importando..." : "Iniciar Importação"}
            </Button>
          )}
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado da Importação</CardTitle>
            <CardDescription>
              {logs.filter(l => l.status === "success").length} sucessos,{" "}
              {logs.filter(l => l.status === "error").length} erros,{" "}
              {logs.filter(l => l.status === "warning").length} avisos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                >
                  {log.status === "success" && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                  {log.status === "error" && <XCircle className="h-4 w-4 text-red-500 mt-0.5" />}
                  {log.status === "warning" && <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                  <div className="flex-1">
                    <span className="font-medium">Linha {log.row}:</span> {log.message}
                    {log.data && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {JSON.stringify(log.data)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

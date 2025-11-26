import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ImportResult } from "@/pages/ImportarProdutos";

interface ImportResultsProps {
  data: any[];
  mapping: Record<string, string>;
  onComplete: (result: ImportResult) => void;
  onReset: () => void;
  result: ImportResult | null;
}

export function ImportResults({ data, mapping, onComplete, onReset, result }: ImportResultsProps) {
  const [progress, setProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!result && !importing) {
      startImport();
    }
  }, []);

  const startImport = async () => {
    setImporting(true);
    const errors: Array<{ linha: number; erro: string }> = [];
    let successCount = 0;

    // Primeiro, buscar grupos e subgrupos existentes
    const { data: grupos } = await supabase.from("grupos").select("id, nome").eq("ativo", true);
    const { data: subgrupos } = await supabase.from("subgrupos").select("id, nome, grupo_id").eq("ativo", true);

    // Mapa reverso para facilitar busca
    const reverseMapping: Record<string, string> = {};
    Object.entries(mapping).forEach(([fileCol, sysField]) => {
      reverseMapping[sysField] = fileCol;
    });

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const linha = i + 2; // +2 porque linha 1 é o header

      try {
        const codigo = row[reverseMapping.codigo];
        const descricao = row[reverseMapping.descricao];

        if (!codigo || !descricao) {
          errors.push({ linha, erro: "Código e descrição são obrigatórios" });
          continue;
        }

        // Verificar se já existe
        const { data: existing } = await supabase
          .from("produtos")
          .select("id")
          .eq("codigo", codigo)
          .maybeSingle();

        if (existing) {
          errors.push({ linha, erro: `Produto com código ${codigo} já existe` });
          continue;
        }

        // Buscar ou criar grupo
        let grupoId = grupos?.[0]?.id; // Fallback para o primeiro grupo
        const categoriaValue = reverseMapping.categoria ? row[reverseMapping.categoria] : null;
        
        if (categoriaValue) {
          const grupoExistente = grupos?.find(g => 
            g.nome.toLowerCase() === categoriaValue.toLowerCase()
          );
          
          if (grupoExistente) {
            grupoId = grupoExistente.id;
          } else {
            // Criar novo grupo
            const { data: novoGrupo, error: grupoError } = await supabase
              .from("grupos")
              .insert({ nome: categoriaValue, codigo: Math.floor(Math.random() * 10000) })
              .select()
              .single();

            if (grupoError) throw grupoError;
            grupoId = novoGrupo.id;
          }
        }

        // Buscar ou criar subgrupo
        let subgrupoId;
        const subgrupoExistente = subgrupos?.find(s => s.grupo_id === grupoId);
        
        if (subgrupoExistente) {
          subgrupoId = subgrupoExistente.id;
        } else {
          // Criar subgrupo padrão
          const { data: novoSubgrupo, error: subgrupoError } = await supabase
            .from("subgrupos")
            .insert({ 
              nome: "Padrão", 
              codigo: Math.floor(Math.random() * 10000),
              grupo_id: grupoId 
            })
            .select()
            .single();

          if (subgrupoError) throw subgrupoError;
          subgrupoId = novoSubgrupo.id;
        }

        // Preparar dados do produto
        const unidade = reverseMapping.unidade ? row[reverseMapping.unidade] : "kg";
        const preco = reverseMapping.preco ? parseFloat(row[reverseMapping.preco]) : null;
        const margem = reverseMapping.margem ? parseFloat(row[reverseMapping.margem]) : null;

        // Inserir produto
        const { error: produtoError } = await supabase
          .from("produtos")
          .insert({
            codigo,
            descricao,
            grupo_id: grupoId,
            subgrupo_id: subgrupoId,
            unidade_venda: unidade,
            preco_ultima_compra: preco,
            margem_padrao: margem,
            ativo: true,
          });

        if (produtoError) throw produtoError;

        successCount++;
      } catch (error: any) {
        console.error(`Erro na linha ${linha}:`, error);
        errors.push({ linha, erro: error.message || "Erro desconhecido" });
      }

      setProgress(((i + 1) / data.length) * 100);
    }

    setImporting(false);
    
    const finalResult = { success: successCount, errors };
    onComplete(finalResult);

    if (successCount > 0) {
      toast({
        title: "Importação concluída",
        description: `${successCount} produtos importados com sucesso`,
      });
    }
  };

  if (importing || !result) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Importando produtos...</h3>
              <p className="text-muted-foreground">
                Por favor, aguarde enquanto processamos seus dados
              </p>
            </div>
            <Progress value={progress} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-muted-foreground">
              {Math.round(progress)}% concluído
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {result.success > 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <strong>{result.success} produtos</strong> importados com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {result.errors.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{result.errors.length} erros</strong> encontrados durante a importação
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Resumo da Importação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {result.success}
              </div>
              <div className="text-sm text-muted-foreground">Produtos importados</div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {result.errors.length}
              </div>
              <div className="text-sm text-muted-foreground">Erros</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Detalhes dos Erros:</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {result.errors.map((error, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm">
                    <span className="font-medium">Linha {error.linha}:</span> {error.erro}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Nova Importação
        </Button>
      </div>
    </div>
  );
}

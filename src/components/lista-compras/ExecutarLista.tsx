import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ExecutarListaProps {
  listaId: string;
}

interface ItemExecucao {
  id: string;
  quantidade: number;
  quantidade_real: number | null;
  valor_pago: number | null;
  comprado: boolean;
  produto_id: string;
  produtos: {
    codigo: string;
    descricao: string;
    unidade_venda: string;
  };
  fornecedores: {
    id: string;
    razao_social: string;
    nome_fantasia: string | null;
  } | null;
}

interface FornecedorExecucao {
  fornecedorId: string;
  fornecedorNome: string;
  itens: ItemExecucao[];
}

export function ExecutarLista({ listaId }: ExecutarListaProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState<FornecedorExecucao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItens();
  }, [listaId]);

  const loadItens = async () => {
    try {
      const { data, error } = await supabase
        .from("itens_lista_compras")
        .select(`
          *,
          produtos(codigo, descricao, unidade_venda),
          fornecedores:fornecedor_sugerido_id(id, razao_social, nome_fantasia)
        `)
        .eq("lista_id", listaId);

      if (error) throw error;

      // Agrupar por fornecedor
      const groupedMap = new Map<string, FornecedorExecucao>();

      data?.forEach((item: any) => {
        const fornecedorId = item.fornecedores?.id || "sem-fornecedor";
        const fornecedorNome = item.fornecedores
          ? item.fornecedores.nome_fantasia || item.fornecedores.razao_social
          : "Sem Fornecedor Definido";

        if (!groupedMap.has(fornecedorId)) {
          groupedMap.set(fornecedorId, {
            fornecedorId,
            fornecedorNome,
            itens: [],
          });
        }

        groupedMap.get(fornecedorId)!.itens.push(item);
      });

      setGrupos(Array.from(groupedMap.values()));
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const marcarComprado = async (itemId: string, comprado: boolean) => {
    try {
      const { error } = await supabase
        .from("itens_lista_compras")
        .update({ comprado })
        .eq("id", itemId);

      if (error) throw error;

      setGrupos((prev) =>
        prev.map((grupo) => ({
          ...grupo,
          itens: grupo.itens.map((item) =>
            item.id === itemId ? { ...item, comprado } : item
          ),
        }))
      );
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const atualizarQuantidadeReal = async (itemId: string, quantidade: number) => {
    try {
      const { error } = await supabase
        .from("itens_lista_compras")
        .update({ quantidade_real: quantidade })
        .eq("id", itemId);

      if (error) throw error;

      setGrupos((prev) =>
        prev.map((grupo) => ({
          ...grupo,
          itens: grupo.itens.map((item) =>
            item.id === itemId ? { ...item, quantidade_real: quantidade } : item
          ),
        }))
      );
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const atualizarValorPago = async (itemId: string, valor: number) => {
    try {
      const { error } = await supabase
        .from("itens_lista_compras")
        .update({ valor_pago: valor })
        .eq("id", itemId);

      if (error) throw error;

      setGrupos((prev) =>
        prev.map((grupo) => ({
          ...grupo,
          itens: grupo.itens.map((item) =>
            item.id === itemId ? { ...item, valor_pago: valor } : item
          ),
        }))
      );
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const finalizarLista = async () => {
    try {
      const { error } = await supabase
        .from("listas_compras")
        .update({ status: "finalizada" })
        .eq("id", listaId);

      if (error) throw error;

      toast({
        title: "Lista finalizada!",
        description: "Todos os itens foram registrados",
      });

      navigate("/lista-compras");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  const todosComprados = grupos.every((grupo) =>
    grupo.itens.every((item) => item.comprado)
  );

  return (
    <div className="space-y-4">
      {grupos.map((grupo) => (
        <Card key={grupo.fornecedorId}>
          <CardHeader>
            <CardTitle>{grupo.fornecedorNome}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {grupo.itens.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg ${
                    item.comprado ? "bg-green-50 dark:bg-green-950" : "bg-background"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={item.comprado}
                      onCheckedChange={(checked) =>
                        marcarComprado(item.id, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="font-medium">
                          {item.produtos.codigo} - {item.produtos.descricao}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Previsto: {item.quantidade} {item.produtos.unidade_venda}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium">Qtd Real</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.quantidade_real || ""}
                            onChange={(e) =>
                              atualizarQuantidadeReal(item.id, parseFloat(e.target.value))
                            }
                            placeholder={item.quantidade.toString()}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Valor Pago (R$)</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.valor_pago || ""}
                            onChange={(e) =>
                              atualizarValorPago(item.id, parseFloat(e.target.value))
                            }
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="p-6">
          <Button
            onClick={finalizarLista}
            disabled={!todosComprados}
            className="w-full"
            size="lg"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Finalizar Lista
          </Button>
          {!todosComprados && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Marque todos os itens como comprados para finalizar
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

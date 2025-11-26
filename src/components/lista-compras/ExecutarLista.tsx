import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Package, ShoppingCart } from "lucide-react";
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

  const gerarCompras = async () => {
    setLoading(true);
    try {
      // Buscar vasilhame padrão
      const { data: vasilhames } = await supabase
        .from("vasilhames")
        .select("id")
        .eq("ativo", true)
        .limit(1);

      const vasilhameId = vasilhames?.[0]?.id;

      if (!vasilhameId) {
        toast({
          title: "Erro",
          description: "Nenhum vasilhame cadastrado no sistema",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      let comprasCriadas = 0;

      // Criar uma compra para cada fornecedor
      for (const grupo of grupos) {
        const itensComprados = grupo.itens.filter(item => item.comprado);
        
        if (itensComprados.length === 0 || grupo.fornecedorId === "sem-fornecedor") {
          continue;
        }

        // Calcular total do fornecedor
        const totalFornecedor = itensComprados.reduce((sum, item) => {
          const qtd = item.quantidade_real || item.quantidade;
          const valor = item.valor_pago || 0;
          return sum + (qtd * valor);
        }, 0);

        // Criar compra
        const { data: compra, error: compraError } = await supabase
          .from("compras")
          .insert({
            fornecedor_id: grupo.fornecedorId,
            status: "confirmado",
            valor_produtos: totalFornecedor,
            valor_total: totalFornecedor,
            numero_compra: 0,
          })
          .select()
          .single();

        if (compraError) throw compraError;

        // Criar itens da compra
        const itensParaInserir = itensComprados.map(item => {
          const qtd = item.quantidade_real || item.quantidade;
          const valorUnitario = item.valor_pago || 0;
          
          return {
            compra_id: compra.id,
            produto_id: item.produto_id,
            vasilhame_id: vasilhameId,
            quantidade_vasilhames: qtd,
            peso_total_kg: qtd,
            preco_por_vasilhame: valorUnitario,
            preco_por_kg: valorUnitario,
            subtotal: qtd * valorUnitario,
          };
        });

        const { error: itensError } = await supabase
          .from("itens_compra")
          .insert(itensParaInserir);

        if (itensError) throw itensError;

        comprasCriadas++;
      }

      // Atualizar status da lista
      const { error: updateError } = await supabase
        .from("listas_compras")
        .update({ status: "finalizada" })
        .eq("id", listaId);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso!",
        description: `${comprasCriadas} compra${comprasCriadas !== 1 ? 's' : ''} gerada${comprasCriadas !== 1 ? 's' : ''} automaticamente`,
      });

      navigate("/lista-compras");
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

  const finalizarSemGerar = async () => {
    try {
      const { error } = await supabase
        .from("listas_compras")
        .update({ status: "finalizada" })
        .eq("id", listaId);

      if (error) throw error;

      toast({
        title: "Lista finalizada!",
        description: "Lista marcada como finalizada",
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

  const temItensComprados = grupos.some((grupo) =>
    grupo.itens.some((item) => item.comprado)
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
        <CardContent className="p-6 space-y-3">
          <Button
            onClick={gerarCompras}
            disabled={!todosComprados || loading}
            className="w-full"
            size="lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {loading ? "Gerando Compras..." : "Gerar Compras Automáticas"}
          </Button>
          
          <Button
            onClick={finalizarSemGerar}
            disabled={!temItensComprados || loading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Finalizar Sem Gerar Compras
          </Button>

          {!todosComprados && temItensComprados && (
            <p className="text-sm text-muted-foreground text-center">
              ⚠️ Alguns itens ainda não foram marcados como comprados
            </p>
          )}
          
          {!temItensComprados && (
            <p className="text-sm text-muted-foreground text-center">
              Marque os itens como comprados para finalizar
            </p>
          )}

          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Dica:</strong> "Gerar Compras" cria automaticamente os pedidos por fornecedor usando os valores reais
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

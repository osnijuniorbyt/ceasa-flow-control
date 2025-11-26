import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputNumericoMobile } from "@/components/compras-ceasa/InputNumericoMobile";
import { ClipboardList, Check, X, Save, ChevronRight, Package } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ItemExecucao {
  id: string;
  produto_id: string;
  produto_codigo: string;
  produto_nome: string;
  unidade: string;
  quantidade: number;
  comprado: boolean;
  valor_pago: string;
  fornecedor_id: string;
  fornecedor_sugerido_id?: string;
  fornecedor_sugerido_nome?: string;
}

export default function ExecutarListaCeasa() {
  const [listaSelecionada, setListaSelecionada] = useState<string | null>(null);
  const [itensExecucao, setItensExecucao] = useState<ItemExecucao[]>([]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Buscar listas pendentes
  const { data: listas } = useQuery({
    queryKey: ["listas-pendentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listas_compras")
        .select("*")
        .in("status", ["rascunho", "ativa"])
        .order("data_compra", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Buscar fornecedores
  const { data: fornecedores } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("*")
        .eq("ativo", true)
        .order("nome_fantasia");
      if (error) throw error;
      return data;
    },
  });

  // Buscar itens da lista selecionada
  const { data: itensLista } = useQuery({
    queryKey: ["itens-lista", listaSelecionada],
    queryFn: async () => {
      if (!listaSelecionada) return [];

      const { data, error } = await supabase
        .from("itens_lista_compras")
        .select(`
          *,
          produtos (
            id,
            codigo,
            descricao,
            unidade_venda,
            preco_ultima_compra
          ),
          fornecedores:fornecedor_sugerido_id (
            id,
            nome_fantasia,
            razao_social
          )
        `)
        .eq("lista_id", listaSelecionada);

      if (error) throw error;

      // Converter para formato de execução
      const itens: ItemExecucao[] = (data || []).map((item: any) => ({
        id: item.id,
        produto_id: item.produto_id,
        produto_codigo: item.produtos?.codigo || "",
        produto_nome: item.produtos?.descricao || "",
        unidade: item.produtos?.unidade_venda || "",
        quantidade: Number(item.quantidade),
        comprado: item.comprado || false,
        valor_pago: item.valor_pago ? item.valor_pago.toString() : "",
        fornecedor_id: item.fornecedor_sugerido_id || "",
        fornecedor_sugerido_id: item.fornecedor_sugerido_id,
        fornecedor_sugerido_nome: item.fornecedores?.nome_fantasia || item.fornecedores?.razao_social || "",
      }));

      setItensExecucao(itens);
      return itens;
    },
    enabled: !!listaSelecionada,
  });

  // Buscar vasilhames
  const { data: vasilhames } = useQuery({
    queryKey: ["vasilhames"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vasilhames")
        .select("*")
        .eq("ativo", true);
      if (error) throw error;
      return data || [];
    },
  });

  const finalizarCompraMutation = useMutation({
    mutationFn: async () => {
      const itensComprados = itensExecucao.filter((i) => i.comprado);

      if (itensComprados.length === 0) {
        throw new Error("Marque pelo menos um produto como comprado");
      }

      // Validar que todos os itens comprados têm fornecedor e valor
      const itensInvalidos = itensComprados.filter(
        (i) => !i.fornecedor_id || !i.valor_pago || parseFloat(i.valor_pago) <= 0
      );

      if (itensInvalidos.length > 0) {
        throw new Error("Todos os itens comprados precisam de fornecedor e valor");
      }

      // Agrupar por fornecedor
      const itensPorFornecedor = itensComprados.reduce((acc, item) => {
        if (!acc[item.fornecedor_id]) {
          acc[item.fornecedor_id] = [];
        }
        acc[item.fornecedor_id].push(item);
        return acc;
      }, {} as Record<string, ItemExecucao[]>);

      const vasilhamePadrao = vasilhames?.[0]?.id;
      if (!vasilhamePadrao) {
        throw new Error("Nenhum vasilhame cadastrado");
      }

      // Criar uma compra para cada fornecedor
      const comprasCriadas = [];

      for (const [fornecedorId, itens] of Object.entries(itensPorFornecedor)) {
        const valorTotal = itens.reduce((sum, item) => sum + parseFloat(item.valor_pago), 0);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");
        
        const { data: compra, error: compraError } = await supabase
          .from("compras")
          .insert([{
            fornecedor_id: fornecedorId,
            valor_produtos: valorTotal,
            valor_total: valorTotal,
            status: "confirmado",
            numero_compra: 0,
            user_id: user.id
          }])
          .select()
          .single();

        if (compraError) throw compraError;

        // Criar itens da compra
        const itensCompra = itens.map((item) => ({
          compra_id: compra.id,
          produto_id: item.produto_id,
          vasilhame_id: vasilhamePadrao,
          quantidade_vasilhames: item.quantidade,
          peso_total_kg: item.quantidade,
          preco_por_vasilhame: parseFloat(item.valor_pago),
          preco_por_kg: parseFloat(item.valor_pago) / item.quantidade,
          subtotal: parseFloat(item.valor_pago),
        }));

        const { error: itensError } = await supabase
          .from("itens_compra")
          .insert(itensCompra);

        if (itensError) throw itensError;

        comprasCriadas.push(compra);
      }

      // Atualizar itens da lista como comprados
      for (const item of itensComprados) {
        await supabase
          .from("itens_lista_compras")
          .update({
            comprado: true,
            valor_pago: parseFloat(item.valor_pago),
            fornecedor_id: item.fornecedor_id,
          })
          .eq("id", item.id);
      }

      // Atualizar status da lista
      const todosComprados = itensExecucao.every((i) => i.comprado || itensComprados.some((ic) => ic.id === i.id));
      
      if (todosComprados) {
        await supabase
          .from("listas_compras")
          .update({ status: "finalizada" })
          .eq("id", listaSelecionada);
      }

      return comprasCriadas;
    },
    onSuccess: (compras) => {
      toast.success(`${compras.length} compra(s) registrada(s) com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["listas-pendentes"] });
      queryClient.invalidateQueries({ queryKey: ["compras"] });
      navigate("/compra-rapida");
    },
    onError: (error: any) => {
      console.error("Erro ao finalizar:", error);
      toast.error(`Erro: ${error.message}`);
    },
  });

  const toggleComprado = (itemId: string) => {
    setItensExecucao(
      itensExecucao.map((item) =>
        item.id === itemId ? { ...item, comprado: !item.comprado } : item
      )
    );
  };

  const updateValor = (itemId: string, valor: string) => {
    setItensExecucao(
      itensExecucao.map((item) =>
        item.id === itemId ? { ...item, valor_pago: valor } : item
      )
    );
  };

  const updateFornecedor = (itemId: string, fornecedorId: string) => {
    setItensExecucao(
      itensExecucao.map((item) =>
        item.id === itemId ? { ...item, fornecedor_id: fornecedorId } : item
      )
    );
  };

  const itensComprados = itensExecucao.filter((i) => i.comprado);
  const totalComprado = itensComprados.reduce(
    (sum, item) => sum + parseFloat(item.valor_pago || "0"),
    0
  );

  if (!listaSelecionada) {
    return (
      <div className="min-h-screen p-4 space-y-4 pb-24">
        <div className="bg-primary text-primary-foreground p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardList className="h-8 w-8" />
            Executar Lista
          </h1>
          <p className="text-lg mt-1 opacity-90">Lançar compras de lista pré-feita</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Selecione uma Lista</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {listas && listas.length > 0 ? (
              listas.map((lista) => (
                <button
                  key={lista.id}
                  onClick={() => setListaSelecionada(lista.id)}
                  className="w-full p-4 border-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-lg">{lista.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(lista.data_compra), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma lista pendente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 space-y-4 pb-32">
      <div className="bg-primary text-primary-foreground p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Executar Lista</h1>
            <p className="text-sm mt-1 opacity-90">
              {itensComprados.length} de {itensExecucao.length} comprados
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setListaSelecionada(null);
              setItensExecucao([]);
            }}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="space-y-3">
        {itensExecucao.map((item) => (
          <Card
            key={item.id}
            className={`border-2 transition-all ${
              item.comprado
                ? "border-green-500 bg-green-50/50"
                : "border-border"
            }`}
          >
            <CardContent className="pt-4 space-y-4">
              {/* Header com Checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={item.comprado}
                  onCheckedChange={() => toggleComprado(item.id)}
                  className="h-8 w-8 mt-1"
                />
                <div className="flex-1">
                  <div className="font-bold text-lg">
                    {item.produto_codigo} - {item.produto_nome}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Quantidade: {item.quantidade} {item.unidade}
                  </div>
                </div>
              </div>

              {/* Campos de Execução */}
              {item.comprado && (
                <div className="space-y-4 pt-2 border-t">
                  {/* Fornecedor */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Fornecedor</label>
                    <Select
                      value={item.fornecedor_id}
                      onValueChange={(value) => updateFornecedor(item.id, value)}
                    >
                      <SelectTrigger className="h-14 text-base border-2">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {item.fornecedor_sugerido_id && (
                          <SelectItem
                            value={item.fornecedor_sugerido_id}
                            className="text-base py-3 font-semibold bg-primary/10"
                          >
                            ⭐ {item.fornecedor_sugerido_nome}
                          </SelectItem>
                        )}
                        {fornecedores
                          ?.filter((f) => f.id !== item.fornecedor_sugerido_id)
                          .map((f) => (
                            <SelectItem key={f.id} value={f.id} className="text-base py-3">
                              {f.nome_fantasia || f.razao_social}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Valor Pago */}
                  <InputNumericoMobile
                    label="Valor Pago"
                    value={item.valor_pago}
                    onChange={(value) => updateValor(item.id, value)}
                    placeholder="0,00"
                    prefix="R$"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Fixo */}
      {itensComprados.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t-2 border-primary p-4 shadow-lg">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  {itensComprados.length} itens comprados
                </div>
                <div className="text-3xl font-bold text-green-600">
                  R$ {totalComprado.toFixed(2)}
                </div>
              </div>
            </div>
            
            <Button
              size="lg"
              className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-700"
              onClick={() => finalizarCompraMutation.mutate()}
              disabled={finalizarCompraMutation.isPending}
            >
              <Save className="h-6 w-6 mr-2" />
              {finalizarCompraMutation.isPending ? "Salvando..." : "Finalizar Compra"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
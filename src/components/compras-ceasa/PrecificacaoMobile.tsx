import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Search, Save } from "lucide-react";
import { toast } from "sonner";

interface ProdutoPreco {
  id: string;
  codigo: string;
  descricao: string;
  preco_ultima_compra: number | null;
  margem_padrao: number | null;
  unidade_venda: string;
}

export function PrecificacaoMobile() {
  const [busca, setBusca] = useState("");
  const [grupoFiltro, setGrupoFiltro] = useState<string>("todos");
  const [editando, setEditando] = useState<{ [key: string]: { margem: string } }>({});
  const queryClient = useQueryClient();

  const { data: grupos } = useQuery({
    queryKey: ["grupos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grupos")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: produtos } = useQuery({
    queryKey: ["produtos-precificacao", grupoFiltro, busca],
    queryFn: async () => {
      let query = supabase
        .from("produtos")
        .select("id, codigo, descricao, preco_ultima_compra, margem_padrao, unidade_venda, grupo_id")
        .eq("ativo", true)
        .order("codigo");

      if (grupoFiltro !== "todos") {
        query = query.eq("grupo_id", grupoFiltro);
      }

      if (busca) {
        query = query.or(`codigo.ilike.%${busca}%,descricao.ilike.%${busca}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as ProdutoPreco[];
    },
  });

  const salvarMargemMutation = useMutation({
    mutationFn: async ({ produtoId, margem }: { produtoId: string; margem: number }) => {
      const { error } = await supabase
        .from("produtos")
        .update({ margem_padrao: margem })
        .eq("id", produtoId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Margem atualizada");
      queryClient.invalidateQueries({ queryKey: ["produtos-precificacao"] });
      setEditando({});
    },
    onError: () => {
      toast.error("Erro ao atualizar margem");
    },
  });

  const calcularPrecoVenda = (precoCusto: number | null, margem: number | null) => {
    if (!precoCusto || !margem) return "-";
    const precoVenda = precoCusto * (1 + margem / 100);
    return `R$ ${precoVenda.toFixed(2)}`;
  };

  const handleMargemChange = (produtoId: string, value: string) => {
    setEditando({
      ...editando,
      [produtoId]: { margem: value },
    });
  };

  const handleSalvarMargem = (produtoId: string) => {
    const margemStr = editando[produtoId]?.margem;
    if (!margemStr) return;

    const margem = parseFloat(margemStr);
    if (isNaN(margem)) {
      toast.error("Margem inválida");
      return;
    }

    salvarMargemMutation.mutate({ produtoId, margem });
  };

  return (
    <div className="space-y-3 p-2">
      {/* Filtros */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4" />
            Gestão de Preços
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código ou nome"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <Select value={grupoFiltro} onValueChange={setGrupoFiltro}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Filtrar por grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os grupos</SelectItem>
              {grupos?.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <div className="space-y-2">
        {produtos?.map((produto) => {
          const margemEditando = editando[produto.id]?.margem;
          const margemAtual = margemEditando !== undefined ? margemEditando : produto.margem_padrao?.toString() || "";
          const estaEditando = margemEditando !== undefined;

          return (
            <Card key={produto.id} className="border">
              <CardContent className="p-3 space-y-2">
                <div>
                  <div className="font-semibold text-sm">
                    {produto.codigo} - {produto.descricao}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Unidade: {produto.unidade_venda}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Custo</div>
                    <div className="font-bold text-sm">
                      {produto.preco_ultima_compra
                        ? `R$ ${produto.preco_ultima_compra.toFixed(2)}`
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Preço Venda</div>
                    <div className="font-bold text-sm text-green-600">
                      {calcularPrecoVenda(
                        produto.preco_ultima_compra,
                        parseFloat(margemAtual) || produto.margem_padrao
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">Margem %</div>
                    <Input
                      type="number"
                      step="0.1"
                      value={margemAtual}
                      onChange={(e) => handleMargemChange(produto.id, e.target.value)}
                      placeholder="Ex: 30"
                      className="h-10 text-base"
                    />
                  </div>
                  {estaEditando && (
                    <Button
                      size="sm"
                      onClick={() => handleSalvarMargem(produto.id)}
                      disabled={salvarMargemMutation.isPending}
                      className="h-10"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {produtos && produtos.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              Nenhum produto encontrado
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

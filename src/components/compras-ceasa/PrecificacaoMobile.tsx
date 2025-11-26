import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, Search, Save, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PrecificacaoMobileProps {
  loteData: string;
  onLoteDataChange: (data: string) => void;
}

export function PrecificacaoMobile({ loteData, onLoteDataChange }: PrecificacaoMobileProps) {
  const [date, setDate] = useState<Date>(new Date(loteData));
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<{ [key: string]: { margem: string } }>({});
  const queryClient = useQueryClient();

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const dateStr = newDate.toISOString().split('T')[0];
      setDate(newDate);
      onLoteDataChange(dateStr);
    }
  };

  // Buscar produtos únicos comprados neste lote
  const { data: produtosLote } = useQuery({
    queryKey: ["produtos-lote-precificacao", loteData, busca],
    queryFn: async () => {
      // Buscar todas as compras do lote
      const { data: compras, error: comprasError } = await supabase
        .from("compras")
        .select("id")
        .eq("data_compra", loteData);

      if (comprasError) throw comprasError;
      if (!compras || compras.length === 0) return [];

      const compraIds = compras.map(c => c.id);

      // Buscar itens dessas compras
      let query = supabase
        .from("itens_compra")
        .select(`
          produto_id,
          preco_por_kg,
          subtotal,
          peso_total_kg,
          produtos (
            id,
            codigo,
            descricao,
            unidade_venda,
            margem_padrao,
            preco_ultima_compra
          )
        `)
        .in("compra_id", compraIds);

      const { data: itens, error: itensError } = await query;
      if (itensError) throw itensError;

      // Agrupar por produto
      const produtosMap = new Map();
      itens?.forEach((item: any) => {
        if (item.produtos) {
          const pid = item.produtos.id;
          if (!produtosMap.has(pid)) {
            produtosMap.set(pid, {
              ...item.produtos,
              preco_custo_lote: item.preco_por_kg,
            });
          }
        }
      });

      let produtos = Array.from(produtosMap.values());

      // Filtrar por busca
      if (busca) {
        produtos = produtos.filter((p: any) =>
          p.codigo.toLowerCase().includes(busca.toLowerCase()) ||
          p.descricao.toLowerCase().includes(busca.toLowerCase())
        );
      }

      return produtos;
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
      queryClient.invalidateQueries({ queryKey: ["produtos-lote-precificacao"] });
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
      {/* Seletor de Lote/Data */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4" />
            Precificação do Lote
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-3 pb-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-10 justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {format(date, "dd/MM/yyyy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <div className="space-y-2">
        {produtosLote && produtosLote.length > 0 ? (
          produtosLote.map((produto: any) => {
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
                      {produto.unidade_venda}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Custo (Lote)</div>
                      <div className="font-bold text-sm">
                        {produto.preco_custo_lote
                          ? `R$ ${produto.preco_custo_lote.toFixed(2)}/kg`
                          : "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Preço Venda</div>
                      <div className="font-bold text-sm text-green-600">
                        {calcularPrecoVenda(
                          produto.preco_custo_lote,
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
          })
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              Nenhum produto encontrado neste lote
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

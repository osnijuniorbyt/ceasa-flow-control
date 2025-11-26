import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DollarSign, Search, Save, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ValidarLoteMobile } from "./ValidarLoteMobile";

interface PrecificacaoMobileProps {
  loteData: string;
  onLoteDataChange: (data: string) => void;
}

export function PrecificacaoMobile({ loteData, onLoteDataChange }: PrecificacaoMobileProps) {
  const [date, setDate] = useState<Date>(new Date(loteData));
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Record<string, string>>({});
  const [editandoPrecoVenda, setEditandoPrecoVenda] = useState<Record<string, string>>({});
  const [margemLote, setMargemLote] = useState("30");
  const queryClient = useQueryClient();

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const dateStr = newDate.toISOString().split('T')[0];
      setDate(newDate);
      onLoteDataChange(dateStr);
      setEditando({});
      setEditandoPrecoVenda({});
    }
  };

  useEffect(() => {
    setDate(new Date(loteData));
  }, [loteData]);

  // Buscar produtos únicos comprados neste lote com histórico
  const { data: produtosLote = [] } = useQuery({
    queryKey: ["produtos-lote-precificacao", loteData, busca],
    queryFn: async () => {
      const { data: compras, error: comprasError } = await supabase
        .from("compras")
        .select("id")
        .eq("data_compra", loteData);

      if (comprasError) throw comprasError;
      if (!compras || compras.length === 0) return [];

      const compraIds = compras.map(c => c.id);

      const { data: itens, error: itensError } = await supabase
        .from("itens_compra")
        .select(`
          produto_id,
          preco_por_kg,
          preco_venda_sugerido,
          produtos (
            id,
            codigo,
            descricao,
            unidade_venda,
            margem_padrao,
            preco_ultima_compra,
            data_ultima_compra
          )
        `)
        .in("compra_id", compraIds);

      if (itensError) throw itensError;

      // Agrupar por produto
      const produtosMap = new Map();
      itens?.forEach((item: any) => {
        if (item.produtos && item.preco_por_kg) {
          const pid = item.produtos.id;
          if (!produtosMap.has(pid)) {
            produtosMap.set(pid, {
              id: item.produtos.id,
              codigo: item.produtos.codigo,
              descricao: item.produtos.descricao,
              unidade_venda: item.produtos.unidade_venda,
              precoCustoAtual: item.preco_por_kg || 0,
              precoVendaAtual: item.preco_venda_sugerido || 0,
              margem: item.produtos.margem_padrao || 30,
              precoCustoAnterior: item.produtos.preco_ultima_compra || null,
              dataUltimaCompra: item.produtos.data_ultima_compra || null,
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
      setEditandoPrecoVenda({});
    },
    onError: () => {
      toast.error("Erro ao atualizar margem");
    },
  });

  const calcularPrecoVenda = (custo: number, margem: number) => {
    return custo * (1 + margem / 100);
  };

  const calcularMargemDoPrecoVenda = (custo: number, precoVenda: number) => {
    if (custo === 0) return 0;
    return ((precoVenda - custo) / custo) * 100;
  };

  // Calcular estatísticas baseadas no lucro total
  const estatisticasLote = produtosLote.reduce(
    (acc, produto: any) => {
      if (!produto?.precoCustoAtual) return acc;
      
      const margem = editando[produto.id] ? parseFloat(editando[produto.id]) : produto.margem;
      const precoVenda = editandoPrecoVenda[produto.id]
        ? parseFloat(editandoPrecoVenda[produto.id])
        : calcularPrecoVenda(produto.precoCustoAtual, margem);
      
      const lucro = precoVenda - produto.precoCustoAtual;
      const custoTotal = produto.precoCustoAtual;

      return {
        lucroTotal: acc.lucroTotal + lucro,
        custoTotal: acc.custoTotal + custoTotal,
        quantidadeProdutos: acc.quantidadeProdutos + 1,
      };
    },
    { lucroTotal: 0, custoTotal: 0, quantidadeProdutos: 0 }
  );

  const margemMediaPonderada =
    estatisticasLote.custoTotal > 0
      ? (estatisticasLote.lucroTotal / estatisticasLote.custoTotal) * 100
      : 0;

  const handleMargemChange = (produtoId: string, value: string) => {
    setEditando({ ...editando, [produtoId]: value });
  };

  const handleSalvarMargem = (produtoId: string) => {
    const margemStr = editando[produtoId];
    if (!margemStr) return;

    const margem = parseFloat(margemStr);
    if (isNaN(margem)) {
      toast.error("Margem inválida");
      return;
    }

    salvarMargemMutation.mutate({ produtoId, margem });
  };

  const handleSalvarPrecoVenda = (produtoId: string) => {
    const precoVendaStr = editandoPrecoVenda[produtoId];
    if (!precoVendaStr) return;

    const precoVenda = parseFloat(precoVendaStr);
    if (isNaN(precoVenda) || precoVenda <= 0) {
      toast.error("Preço inválido");
      return;
    }

    const produto = produtosLote.find((p: any) => p.id === produtoId);
    if (!produto) return;

    // Calcular margem baseada no preço de venda
    const novaMargem = calcularMargemDoPrecoVenda(produto.precoCustoAtual, precoVenda);
    salvarMargemMutation.mutate({ produtoId, margem: novaMargem });
  };

  const aplicarMargemEmTodos = async () => {
    const margem = parseFloat(margemLote);
    if (isNaN(margem)) {
      toast.error("Margem inválida");
      return;
    }

    try {
      const updates = produtosLote.map((produto: any) =>
        supabase
          .from("produtos")
          .update({ margem_padrao: margem })
          .eq("id", produto.id)
      );

      await Promise.all(updates);
      
      toast.success("Margem aplicada em todos os produtos");
      queryClient.invalidateQueries({ queryKey: ["produtos-lote-precificacao"] });
    } catch (error) {
      toast.error("Erro ao aplicar margem");
    }
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

          <div className="pt-2 border-t space-y-2">
            <Label className="text-xs text-muted-foreground">Margem Padrão do Lote</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.1"
                value={margemLote}
                onChange={(e) => setMargemLote(e.target.value)}
                className="h-9"
                placeholder="30"
              />
              <Button size="sm" onClick={aplicarMargemEmTodos} className="shrink-0 h-9">
                Aplicar
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>Produtos: {estatisticasLote.quantidadeProdutos}</p>
              <p className="font-semibold">Margem Média: {margemMediaPonderada.toFixed(2)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <div className="space-y-2">
        {produtosLote && produtosLote.length > 0 ? (
          produtosLote.filter((p: any) => p?.precoCustoAtual).map((produto: any) => {
            const margemAtual = editando[produto.id]
              ? parseFloat(editando[produto.id])
              : produto.margem;
            
            const precoVenda = editandoPrecoVenda[produto.id]
              ? parseFloat(editandoPrecoVenda[produto.id])
              : calcularPrecoVenda(produto.precoCustoAtual || 0, margemAtual);

            const variacao = produto.precoCustoAnterior && produto.precoCustoAtual
              ? ((produto.precoCustoAtual - produto.precoCustoAnterior) / produto.precoCustoAnterior) * 100
              : null;

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

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Custo Atual</div>
                      <div className="font-bold text-sm">
                        R$ {produto.precoCustoAtual.toFixed(2)}
                      </div>
                    </div>
                     <div>
                       <div className="text-muted-foreground">Anterior</div>
                       {produto.precoCustoAnterior ? (
                         <div className="space-y-0.5">
                           <Input
                             type="number"
                             step="0.01"
                             value={produto.precoCustoAnterior.toFixed(2)}
                             readOnly
                             className="h-7 text-xs font-semibold text-center"
                           />
                           {variacao !== null && (
                             <div
                               className={`text-center text-[10px] font-medium ${
                                 variacao > 0 ? "text-red-500" : "text-green-500"
                               }`}
                             >
                               {variacao > 0 ? "+" : ""}{variacao.toFixed(1)}%
                             </div>
                           )}
                         </div>
                       ) : (
                         <div className="text-muted-foreground text-sm text-center">-</div>
                       )}
                     </div>
                    <div>
                      <div className="text-muted-foreground">Venda</div>
                      <div className="font-bold text-sm text-green-600">
                        R$ {precoVenda.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Margem %</Label>
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          step="0.1"
                          value={editando[produto.id] ?? produto.margem}
                          onChange={(e) => handleMargemChange(produto.id, e.target.value)}
                          className="h-9 text-sm"
                        />
                        {editando[produto.id] && (
                          <Button
                            size="sm"
                            onClick={() => handleSalvarMargem(produto.id)}
                            disabled={salvarMargemMutation.isPending}
                            className="h-9 px-2"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Preço R$</Label>
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={editandoPrecoVenda[produto.id] ?? precoVenda.toFixed(2)}
                          onChange={(e) =>
                            setEditandoPrecoVenda({ ...editandoPrecoVenda, [produto.id]: e.target.value })
                          }
                          className="h-9 text-sm"
                        />
                        {editandoPrecoVenda[produto.id] && (
                          <Button
                            size="sm"
                            onClick={() => handleSalvarPrecoVenda(produto.id)}
                            disabled={salvarMargemMutation.isPending}
                            className="h-9 px-2"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
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

      <ValidarLoteMobile
        loteData={loteData}
        produtosLote={produtosLote}
        margens={editando}
        precosVenda={editandoPrecoVenda}
      />
    </div>
  );
}

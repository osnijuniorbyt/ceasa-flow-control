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
  const [produtoFocado, setProdutoFocado] = useState<number>(0);
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
          peso_total_kg,
          quantidade_vasilhames,
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

      // Agrupar por produto e calcular total
      const produtosMap = new Map();
      let pesoTotalGeral = 0;
      
      itens?.forEach((item: any) => {
        if (item.produtos && item.preco_por_kg) {
          const pid = item.produtos.id;
          const pesoItem = item.peso_total_kg || 0;
          pesoTotalGeral += pesoItem;
          
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
              quantidadeTotal: pesoItem,
              quantidadeVasilhames: item.quantidade_vasilhames || 0,
            });
          } else {
            const p = produtosMap.get(pid);
            p.quantidadeTotal += pesoItem;
            p.quantidadeVasilhames += item.quantidade_vasilhames || 0;
          }
        }
      });

      // Calcular porcentagem
      produtosMap.forEach((produto) => {
        produto.porcentagemLote = pesoTotalGeral > 0 
          ? (produto.quantidadeTotal / pesoTotalGeral) * 100 
          : 0;
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

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const produtosFiltrados = produtosLote.filter((p: any) => p?.precoCustoAtual);
      
      // Alt + Seta Baixo: próximo produto
      if (e.altKey && e.key === "ArrowDown") {
        e.preventDefault();
        setProdutoFocado(prev => Math.min(prev + 1, produtosFiltrados.length - 1));
        const nextProduto = produtosFiltrados[Math.min(produtoFocado + 1, produtosFiltrados.length - 1)];
        document.getElementById(`card-${nextProduto?.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      
      // Alt + Seta Cima: produto anterior
      if (e.altKey && e.key === "ArrowUp") {
        e.preventDefault();
        setProdutoFocado(prev => Math.max(prev - 1, 0));
        const prevProduto = produtosFiltrados[Math.max(produtoFocado - 1, 0)];
        document.getElementById(`card-${prevProduto?.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Alt + M: focar campo margem do produto atual
      if (e.altKey && e.key === "m") {
        e.preventDefault();
        const inputMargem = document.getElementById(`margem-${produtosFiltrados[produtoFocado]?.id}`) as HTMLInputElement;
        inputMargem?.focus();
        inputMargem?.select();
      }

      // Alt + P: focar campo preço do produto atual
      if (e.altKey && e.key === "p") {
        e.preventDefault();
        const inputPreco = document.getElementById(`preco-${produtosFiltrados[produtoFocado]?.id}`) as HTMLInputElement;
        inputPreco?.focus();
        inputPreco?.select();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [produtosLote, produtoFocado]);

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
      {/* Seletor de Lote/Data - STICKY */}
      <Card className="sticky top-[60px] z-10 shadow-md">
        <CardContent className="p-3 space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-9 justify-start text-left font-normal text-sm">
                <Calendar className="mr-2 h-3 w-3" />
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
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Buscar"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>

          <div className="text-[10px] text-muted-foreground flex justify-between pt-1 border-t">
            <span>{estatisticasLote.quantidadeProdutos} produtos</span>
            <span className="font-semibold">Margem: {margemMediaPonderada.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <div className="space-y-2">
        {produtosLote && produtosLote.length > 0 ? (
          produtosLote.filter((p: any) => p?.precoCustoAtual).map((produto: any, index: number) => {
            const margemAtual = editando[produto.id]
              ? parseFloat(editando[produto.id])
              : produto.margem;
            
            const precoVenda = editandoPrecoVenda[produto.id]
              ? parseFloat(editandoPrecoVenda[produto.id])
              : calcularPrecoVenda(produto.precoCustoAtual || 0, margemAtual);

            const variacao = produto.precoCustoAnterior && produto.precoCustoAtual
              ? ((produto.precoCustoAtual - produto.precoCustoAnterior) / produto.precoCustoAnterior) * 100
              : null;

            const isFocado = index === produtoFocado;

            return (
              <Card 
                key={produto.id} 
                id={`card-${produto.id}`}
                className={`border transition-all ${isFocado ? "ring-2 ring-primary shadow-lg" : ""}`}
              >
                <CardContent className="p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-base leading-tight">
                        {produto.codigo} - {produto.descricao}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{produto.unidade_venda}</span>
                        <span className="text-[10px] text-blue-600 font-medium">
                          Total: R$ {(produto.quantidadeTotal * produto.precoCustoAtual).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-blue-600/70">
                          {produto.porcentagemLote?.toFixed(1)}% lote
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-2">
                    <div>
                      <div className="text-muted-foreground text-[9px]">Custo</div>
                      <div className="font-bold text-sm">
                        R$ {produto.precoCustoAtual.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right opacity-50">
                      <div className="text-muted-foreground text-[8px]">Ant</div>
                      {produto.precoCustoAnterior ? (
                        <div className="text-[9px] font-medium">
                          R$ {produto.precoCustoAnterior.toFixed(2)}
                          {variacao !== null && (
                            <span className={`ml-1 ${variacao > 0 ? "text-red-500" : "text-green-500"}`}>
                              {variacao > 0 ? "+" : ""}{variacao.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-[9px]">-</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground text-[9px]">Venda</div>
                      <div className="font-bold text-base text-green-600">
                        R$ {precoVenda.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[60px_1fr] gap-2">
                    <div>
                      <Label className="text-[9px] text-muted-foreground">Mrg%</Label>
                      <Input
                        id={`margem-${produto.id}`}
                        type="tel"
                        inputMode="decimal"
                        pattern="[0-9]*"
                        value={editando[produto.id] ?? produto.margem}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 3 || value.includes('.')) {
                            handleMargemChange(produto.id, value);
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSalvarMargem(produto.id);
                          }
                        }}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div>
                      <Label className="text-[9px] text-muted-foreground font-medium">Digitar Preço R$</Label>
                      <Input
                        id={`preco-${produto.id}`}
                        type="tel"
                        inputMode="decimal"
                        pattern="[0-9.]*"
                        value={editandoPrecoVenda[produto.id] ?? precoVenda.toFixed(2)}
                        onChange={(e) =>
                          setEditandoPrecoVenda({ ...editandoPrecoVenda, [produto.id]: e.target.value })
                        }
                        onFocus={(e) => e.target.select()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSalvarPrecoVenda(produto.id);
                          }
                        }}
                        className="h-8 text-sm font-semibold"
                      />
                    </div>
                  </div>
                  
                  {(editando[produto.id] || editandoPrecoVenda[produto.id]) && (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (editando[produto.id]) handleSalvarMargem(produto.id);
                        if (editandoPrecoVenda[produto.id]) handleSalvarPrecoVenda(produto.id);
                      }}
                      disabled={salvarMargemMutation.isPending}
                      className="w-full h-7 text-xs"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Salvar
                    </Button>
                  )}
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

      {/* Ajuda de Atalhos */}
      <Card className="border-dashed bg-muted/30">
        <CardContent className="p-2 text-[10px] text-muted-foreground">
          <div className="font-semibold mb-1">Atalhos:</div>
          <div className="grid grid-cols-2 gap-1">
            <div>Alt + ↑/↓: Navegar produtos</div>
            <div>Alt + M: Editar margem</div>
            <div>Alt + P: Editar preço</div>
            <div>Enter: Salvar</div>
          </div>
        </CardContent>
      </Card>

      <ValidarLoteMobile
        loteData={loteData}
        produtosLote={produtosLote}
        margens={editando}
        precosVenda={editandoPrecoVenda}
      />
    </div>
  );
}

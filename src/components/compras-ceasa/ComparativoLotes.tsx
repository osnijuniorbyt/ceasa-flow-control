import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function ComparativoLotes() {
  const [dataLote1, setDataLote1] = useState<Date>(new Date());
  const [dataLote2, setDataLote2] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });

  const lote1Str = dataLote1.toISOString().split('T')[0];
  const lote2Str = dataLote2.toISOString().split('T')[0];

  // Buscar produtos do lote 1
  const { data: produtosLote1 } = useQuery({
    queryKey: ["produtos-comparativo", lote1Str],
    queryFn: async () => {
      const { data: compras } = await supabase
        .from("compras")
        .select("id")
        .eq("data_compra", lote1Str);

      if (!compras || compras.length === 0) return [];

      const { data: itens } = await supabase
        .from("itens_compra")
        .select(`
          produto_id,
          preco_por_kg,
          produtos (
            id,
            codigo,
            descricao,
            unidade_venda
          )
        `)
        .in("compra_id", compras.map(c => c.id));

      const produtosMap = new Map();
      itens?.forEach((item: any) => {
        if (item.produtos) {
          const pid = item.produtos.id;
          if (!produtosMap.has(pid) || item.preco_por_kg < produtosMap.get(pid).preco) {
            produtosMap.set(pid, {
              ...item.produtos,
              preco: item.preco_por_kg,
            });
          }
        }
      });

      return Array.from(produtosMap.values());
    },
  });

  // Buscar produtos do lote 2
  const { data: produtosLote2 } = useQuery({
    queryKey: ["produtos-comparativo", lote2Str],
    queryFn: async () => {
      const { data: compras } = await supabase
        .from("compras")
        .select("id")
        .eq("data_compra", lote2Str);

      if (!compras || compras.length === 0) return [];

      const { data: itens } = await supabase
        .from("itens_compra")
        .select(`
          produto_id,
          preco_por_kg,
          produtos (
            id,
            codigo,
            descricao,
            unidade_venda
          )
        `)
        .in("compra_id", compras.map(c => c.id));

      const produtosMap = new Map();
      itens?.forEach((item: any) => {
        if (item.produtos) {
          const pid = item.produtos.id;
          if (!produtosMap.has(pid) || item.preco_por_kg < produtosMap.get(pid).preco) {
            produtosMap.set(pid, {
              ...item.produtos,
              preco: item.preco_por_kg,
            });
          }
        }
      });

      return Array.from(produtosMap.values());
    },
  });

  // Encontrar produtos em comum
  const produtosComum = produtosLote1
    ?.map((p1: any) => {
      const p2 = produtosLote2?.find((p: any) => p.id === p1.id);
      if (!p2) return null;

      const variacao = ((p1.preco - p2.preco) / p2.preco) * 100;

      return {
        ...p1,
        preco_lote1: p1.preco,
        preco_lote2: p2.preco,
        variacao,
        variacao_absoluta: p1.preco - p2.preco,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => Math.abs(b.variacao) - Math.abs(a.variacao));

  const mediaVariacao = produtosComum?.length
    ? produtosComum.reduce((sum: number, p: any) => sum + p.variacao, 0) / produtosComum.length
    : 0;

  return (
    <div className="space-y-3 p-2">
      {/* Seleção de Lotes */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4" />
            Comparativo de Lotes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-3 pb-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Lote 1 (Novo)</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-10 justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(dataLote1, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dataLote1}
                  onSelect={(date) => date && setDataLote1(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Lote 2 (Anterior)</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-10 justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(dataLote2, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dataLote2}
                  onSelect={(date) => date && setDataLote2(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Resumo */}
          <div className="bg-muted p-2 rounded mt-2">
            <div className="text-xs text-muted-foreground">Produtos em comum</div>
            <div className="text-lg font-bold">{produtosComum?.length || 0}</div>
            <div className="text-xs mt-1">
              Variação média: <span className={cn(
                "font-bold",
                mediaVariacao > 0 ? "text-red-600" : "text-green-600"
              )}>
                {mediaVariacao > 0 ? "+" : ""}{mediaVariacao.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista Comparativa */}
      <div className="space-y-2">
        {produtosComum && produtosComum.length > 0 ? (
          produtosComum.map((produto: any) => (
            <Card key={produto.id} className="border">
              <CardContent className="p-3">
                <div className="font-semibold text-sm mb-2">
                  {produto.codigo} - {produto.descricao}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">
                      {format(dataLote2, "dd/MM", { locale: ptBR })}
                    </div>
                    <div className="font-bold text-base">
                      R$ {produto.preco_lote2.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      {format(dataLote1, "dd/MM", { locale: ptBR })}
                    </div>
                    <div className="font-bold text-base">
                      R$ {produto.preco_lote1.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className={cn(
                  "flex items-center gap-1 mt-2 p-2 rounded text-sm font-bold",
                  produto.variacao > 0 
                    ? "bg-red-50 text-red-600" 
                    : "bg-green-50 text-green-600"
                )}>
                  {produto.variacao > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>
                    {produto.variacao > 0 ? "+" : ""}{produto.variacao.toFixed(1)}%
                  </span>
                  <span className="text-xs font-normal ml-auto">
                    ({produto.variacao > 0 ? "+" : ""}R$ {produto.variacao_absoluta.toFixed(2)})
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum produto em comum entre os lotes</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

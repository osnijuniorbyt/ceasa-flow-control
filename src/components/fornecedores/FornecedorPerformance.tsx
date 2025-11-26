import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Calendar,
  Star,
  Clock,
  AlertCircle
} from "lucide-react";

interface FornecedorPerformanceProps {
  fornecedorId: string;
}

export function FornecedorPerformance({ fornecedorId }: FornecedorPerformanceProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["fornecedor-performance", fornecedorId],
    queryFn: async () => {
      // Buscar compras
      const { data: compras, error: comprasError } = await supabase
        .from("compras")
        .select(`
          id,
          valor_total,
          data_compra,
          status,
          itens_compra (
            id,
            quantidade_vasilhames,
            produto_id
          )
        `)
        .eq("fornecedor_id", fornecedorId);

      if (comprasError) throw comprasError;

      // Buscar produtos vinculados
      const { data: produtos, error: produtosError } = await supabase
        .from("fornecedor_produtos")
        .select("id, preco_habitual, ultima_compra")
        .eq("fornecedor_id", fornecedorId);

      if (produtosError) throw produtosError;

      // Calcular estatísticas
      const totalCompras = compras?.length || 0;
      const valorTotal = compras?.reduce((sum, c) => sum + Number(c.valor_total), 0) || 0;
      const ticketMedio = totalCompras > 0 ? valorTotal / totalCompras : 0;
      
      const totalItens = compras?.reduce((sum, c) => 
        sum + (c.itens_compra?.length || 0), 0) || 0;
      
      const itensMediaPorCompra = totalCompras > 0 ? totalItens / totalCompras : 0;
      
      const comprasConfirmadas = compras?.filter(c => c.status === "confirmado" || c.status === "entregue").length || 0;
      const taxaConfirmacao = totalCompras > 0 ? (comprasConfirmadas / totalCompras) * 100 : 0;

      // Últimas 3 compras
      const ultimasCompras = compras
        ?.sort((a, b) => new Date(b.data_compra).getTime() - new Date(a.data_compra).getTime())
        .slice(0, 3) || [];
      
      const primeiraCompra = compras && compras.length > 0 
        ? new Date(Math.min(...compras.map(c => new Date(c.data_compra).getTime())))
        : null;

      const diasDesdeUltimaCompra = ultimasCompras.length > 0
        ? Math.floor((Date.now() - new Date(ultimasCompras[0].data_compra).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        totalCompras,
        valorTotal,
        ticketMedio,
        itensMediaPorCompra,
        taxaConfirmacao,
        totalProdutosVinculados: produtos?.length || 0,
        primeiraCompra,
        diasDesdeUltimaCompra,
        ultimasCompras
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Erro ao carregar dados</h3>
        </CardContent>
      </Card>
    );
  }

  const performanceScore = Math.min(
    Math.round(
      (stats.taxaConfirmacao * 0.4) +
      (Math.min(stats.totalCompras / 10, 1) * 100 * 0.3) +
      (stats.totalProdutosVinculados > 0 ? 30 : 0)
    ),
    100
  );

  return (
    <div className="space-y-6">
      {/* Score Geral */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Performance Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score de Performance</span>
              <span className="text-2xl font-bold text-primary">{performanceScore}%</span>
            </div>
            <Progress value={performanceScore} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Baseado em taxa de confirmação, volume de compras e produtos vinculados
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              Total de Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCompras}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Desde {stats.primeiraCompra ? stats.primeiraCompra.toLocaleDateString('pt-BR') : 'início'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ {stats.valorTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Volume total de negócios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ {stats.ticketMedio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Por pedido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Itens por Compra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.itensMediaPorCompra.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Média de itens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Taxa de Confirmação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.taxaConfirmacao.toFixed(0)}%</div>
            <Progress value={stats.taxaConfirmacao} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Última Compra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.diasDesdeUltimaCompra !== null ? `${stats.diasDesdeUltimaCompra}d` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dias atrás
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Produtos Vinculados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produtos Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">{stats.totalProdutosVinculados}</div>
          <p className="text-sm text-muted-foreground">
            Produtos vinculados como fornecedor padrão
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
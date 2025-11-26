import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShoppingCart, Calendar, Package, DollarSign } from "lucide-react";

interface FornecedorHistoricoProps {
  fornecedorId: string;
}

export function FornecedorHistorico({ fornecedorId }: FornecedorHistoricoProps) {
  const { data: compras, isLoading } = useQuery({
    queryKey: ["fornecedor-historico", fornecedorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compras")
        .select(`
          *,
          itens_compra (
            id,
            quantidade_vasilhames,
            peso_total_kg,
            subtotal,
            produto_id,
            produtos (
              descricao,
              codigo
            )
          )
        `)
        .eq("fornecedor_id", fornecedorId)
        .order("data_compra", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!compras || compras.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma compra registrada</h3>
          <p className="text-muted-foreground">
            Ainda não há histórico de compras para este fornecedor
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      rascunho: { label: "Rascunho", variant: "outline" },
      confirmado: { label: "Confirmado", variant: "default" },
      entregue: { label: "Entregue", variant: "secondary" },
    };
    
    const config = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      {compras.map((compra) => (
        <Card key={compra.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">Compra #{compra.numero_compra}</span>
                  {getStatusBadge(compra.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(compra.data_compra), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {compra.itens_compra?.length || 0} itens
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-2xl font-bold text-primary">
                  R$ {compra.valor_total.toFixed(2)}
                </div>
              </div>
            </div>

            {compra.itens_compra && compra.itens_compra.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <div className="text-sm font-medium mb-2 text-muted-foreground">Produtos:</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {compra.itens_compra.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm bg-muted/30 p-2 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{item.produtos?.descricao || 'Produto'}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.quantidade_vasilhames} vasilhames • {item.peso_total_kg.toFixed(2)} kg
                        </div>
                      </div>
                      <div className="font-semibold text-primary">
                        R$ {item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {compra.observacoes && (
              <div className="border-t pt-3 mt-3 text-sm">
                <span className="text-muted-foreground">Obs: </span>
                {compra.observacoes}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
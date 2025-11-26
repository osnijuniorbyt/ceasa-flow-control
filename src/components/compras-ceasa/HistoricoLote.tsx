import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HistoricoLoteProps {
  loteData: string;
}

export function HistoricoLote({ loteData }: HistoricoLoteProps) {
  const { data: comprasLote = [] } = useQuery({
    queryKey: ["compras-lote-historico", loteData],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compras")
        .select(`
          id,
          hora_compra,
          numero_compra,
          valor_total,
          created_at,
          fornecedores (
            nome_fantasia,
            razao_social
          ),
          itens_compra (
            id
          )
        `)
        .eq("data_compra", loteData)
        .order("hora_compra", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  if (comprasLote.length === 0) {
    return null;
  }

  return (
    <Card className="border border-blue-500/30">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <History className="h-4 w-4" />
          Compras Lançadas Hoje ({comprasLote.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
          {comprasLote.map((compra: any) => (
            <div
              key={compra.id}
              className="bg-muted/50 rounded-lg p-2 border border-border/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <Clock className="h-3 w-3 text-primary" />
                    <span>{compra.hora_compra.substring(0, 5)}</span>
                    <span className="text-muted-foreground">#{compra.numero_compra}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {compra.fornecedores?.nome_fantasia || compra.fornecedores?.razao_social}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-green-600">
                    R$ {compra.valor_total.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {compra.itens_compra?.length || 0} itens
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

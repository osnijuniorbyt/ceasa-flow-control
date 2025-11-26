import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, DollarSign, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Compra {
  id: string;
  numero_compra: number;
  data_compra: string;
  hora_compra: string;
  valor_total: number;
  status: string;
  fornecedores: {
    razao_social: string;
    nome_fantasia: string | null;
  };
  itens_count: number;
}

export function ComprasRecentes() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompras();

    // Realtime para atualizar quando novas compras forem criadas
    const channel = supabase
      .channel("compras-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "compras",
        },
        () => {
          loadCompras();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadCompras = async () => {
    try {
      const { data, error } = await supabase
        .from("compras")
        .select(`
          id,
          numero_compra,
          data_compra,
          hora_compra,
          valor_total,
          status,
          fornecedores:fornecedor_id(razao_social, nome_fantasia)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Buscar quantidade de itens para cada compra
      const comprasComItens = await Promise.all(
        (data || []).map(async (compra) => {
          const { count } = await supabase
            .from("itens_compra")
            .select("*", { count: "exact", head: true })
            .eq("compra_id", compra.id);

          return {
            ...compra,
            itens_count: count || 0,
          };
        })
      );

      setCompras(comprasComItens as any);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar compras",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      rascunho: { label: "Rascunho", variant: "outline" },
      confirmado: { label: "Confirmado", variant: "default" },
      entregue: { label: "Entregue", variant: "secondary" },
    };
    const statusInfo = statusMap[status] || statusMap.rascunho;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Carregando compras...</p>
        </CardContent>
      </Card>
    );
  }

  if (compras.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compras Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nenhuma compra registrada ainda. Use o formulário abaixo para registrar ou gere compras pela Lista de Compras.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compras Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {compras.map((compra) => (
          <div
            key={compra.id}
            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold text-lg">
                  #{compra.numero_compra} - {compra.fornecedores.nome_fantasia || compra.fornecedores.razao_social}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(compra.data_compra), "dd/MM/yyyy", { locale: ptBR })} às {compra.hora_compra}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {compra.itens_count} {compra.itens_count === 1 ? "item" : "itens"}
                  </span>
                </div>
              </div>
              {getStatusBadge(compra.status)}
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                <DollarSign className="h-4 w-4" />
                R$ {compra.valor_total.toFixed(2)}
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate(`/compra-rapida/${compra.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

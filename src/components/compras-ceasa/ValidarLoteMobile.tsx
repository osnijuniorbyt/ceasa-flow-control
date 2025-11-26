import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ValidarLoteMobileProps {
  loteData: string;
  produtosLote: any[];
  margens: Record<string, string>;
  precosVenda: Record<string, string>;
}

export function ValidarLoteMobile({ 
  loteData, 
  produtosLote, 
  margens, 
  precosVenda 
}: ValidarLoteMobileProps) {
  const queryClient = useQueryClient();

  const validarLoteMutation = useMutation({
    mutationFn: async () => {
      const updates = produtosLote.map(async (produto: any) => {
        const margemStr = margens[produto.id];
        const margem = margemStr ? parseFloat(margemStr) : produto.margem;
        
        const precoVendaStr = precosVenda[produto.id];
        const precoVenda = precoVendaStr 
          ? parseFloat(precoVendaStr)
          : (produto.precoCustoAtual * (1 + margem / 100));

        // Atualizar dados do produto
        const { error } = await supabase
          .from("produtos")
          .update({
            preco_ultima_compra: produto.precoCustoAtual,
            data_ultima_compra: new Date().toISOString(),
            preco_venda_atual: precoVenda,
            data_ultima_venda: new Date().toISOString(),
            margem_padrao: margem,
          })
          .eq("id", produto.id);

        if (error) throw error;
      });

      await Promise.all(updates);
    },
    onSuccess: () => {
      toast.success("Lote validado! Todos os produtos foram atualizados.");
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      queryClient.invalidateQueries({ queryKey: ["compras-lote"] });
    },
    onError: (error: any) => {
      console.error("Erro ao validar lote:", error);
      toast.error(`Erro ao validar: ${error.message}`);
    },
  });

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-3 shadow-lg z-10">
      <Button
        className="w-full h-14 text-lg font-bold"
        size="lg"
        onClick={() => validarLoteMutation.mutate()}
        disabled={validarLoteMutation.isPending || produtosLote.length === 0}
      >
        {validarLoteMutation.isPending ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Validando Lote...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Validar Lote ({produtosLote.length} produtos)
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center mt-2">
        Atualiza preços, margens e histórico de todos os produtos
      </p>
    </div>
  );
}

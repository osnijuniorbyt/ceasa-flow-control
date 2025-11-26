import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useOfflineSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const syncPendingData = async () => {
      // Sincronizar compras pendentes
      const compraPendente = localStorage.getItem('compra_pendente');
      
      if (compraPendente) {
        try {
          const { fornecedor, carrinho, timestamp } = JSON.parse(compraPendente);
          
          // Verificar se ainda está dentro de um período razoável (24h)
          const now = Date.now();
          const hoursSince = (now - timestamp) / (1000 * 60 * 60);
          
          if (hoursSince > 24) {
            toast.error('Compra offline expirada (mais de 24h). Por favor, refaça a compra.');
            localStorage.removeItem('compra_pendente');
            return;
          }

          // Enviar compra
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          const valorTotal = carrinho.reduce((sum: number, item: any) => 
            sum + parseFloat(item.valor_total || "0"), 0
          );

          const { data: compra, error: compraError } = await supabase
            .from("compras")
            .insert([{
              fornecedor_id: fornecedor,
              valor_produtos: valorTotal,
              valor_total: valorTotal,
              status: "confirmado",
              numero_compra: 1,
              user_id: user.id
            }])
            .select()
            .single();

          if (compraError) throw compraError;

          // Inserir itens
          const itens = carrinho.map((item: any) => {
            const qtd = parseFloat(item.quantidade || "1");
            const valor = parseFloat(item.valor_total || "0");

            return {
              compra_id: compra.id,
              produto_id: item.produto_id,
              vasilhame_id: item.vasilhame_id,
              quantidade_vasilhames: qtd,
              peso_total_kg: item.peso_total_kg,
              preco_por_vasilhame: qtd > 0 ? valor / qtd : valor,
              preco_por_kg: item.peso_total_kg > 0 ? valor / item.peso_total_kg : 0,
              subtotal: valor,
            };
          });

          const { error: itensError } = await supabase
            .from("itens_compra")
            .insert(itens);

          if (itensError) throw itensError;

          // Limpar dados offline
          localStorage.removeItem('compra_pendente');
          
          toast.success(`✅ Compra #${compra.numero_compra} sincronizada!`, {
            description: 'Dados offline enviados com sucesso'
          });

          queryClient.invalidateQueries({ queryKey: ["compras"] });
        } catch (error) {
          console.error('Erro ao sincronizar compra:', error);
          toast.error('Erro ao sincronizar compra offline');
        }
      }
    };

    // Sincronizar quando voltar online
    const handleOnline = () => {
      setTimeout(syncPendingData, 1000); // Aguarda 1s para estabilizar conexão
    };

    window.addEventListener('online', handleOnline);

    // Tentar sincronizar ao montar (se já estiver online)
    if (navigator.onLine) {
      syncPendingData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [queryClient]);
}

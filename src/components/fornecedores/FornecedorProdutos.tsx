import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VincularProdutoModal } from "./VincularProdutoModal";

interface ProdutoVinculado {
  id: string;
  preco_habitual: number | null;
  ultima_compra: string | null;
  is_principal: boolean;
  produtos: {
    id: string;
    codigo: string;
    descricao: string;
    unidade_venda: string;
  };
}

interface FornecedorProdutosProps {
  fornecedorId: string;
}

export function FornecedorProdutos({ fornecedorId }: FornecedorProdutosProps) {
  const [produtos, setProdutos] = useState<ProdutoVinculado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProdutos();
  }, [fornecedorId]);

  const loadProdutos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("fornecedor_produtos")
        .select(`
          id,
          preco_habitual,
          ultima_compra,
          is_principal,
          produtos!inner(
            id,
            codigo,
            descricao,
            unidade_venda
          )
        `)
        .eq("fornecedor_id", fornecedorId)
        .order("is_principal", { ascending: false });

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos vinculados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrincipal = async (id: string, isPrincipal: boolean) => {
    try {
      // Se está marcando como principal, desmarcar todos os outros
      if (!isPrincipal) {
        await supabase
          .from("fornecedor_produtos")
          .update({ is_principal: false })
          .eq("fornecedor_id", fornecedorId);
      }

      const { error } = await supabase
        .from("fornecedor_produtos")
        .update({ is_principal: !isPrincipal })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: !isPrincipal ? "Marcado como fornecedor principal" : "Desmarcado como principal",
      });

      loadProdutos();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Deseja remover o vínculo deste produto?")) return;

    try {
      const { error } = await supabase
        .from("fornecedor_produtos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Vínculo removido",
      });

      loadProdutos();
    } catch (error) {
      console.error("Erro ao remover:", error);
      toast({
        title: "Erro",
        description: "Erro ao remover vínculo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Produtos</h3>
          <p className="text-sm text-muted-foreground">
            {produtos.length} produto{produtos.length !== 1 ? "s" : ""} vinculado{produtos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Vincular Produto
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Carregando...
          </CardContent>
        </Card>
      ) : produtos.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Nenhum produto vinculado
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {produtos.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {item.produtos.descricao}
                      {item.is_principal && (
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Cód: {item.produtos.codigo} | {item.produtos.unidade_venda}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.preco_habitual && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Preço habitual:</span>
                    <span className="font-medium">R$ {item.preco_habitual.toFixed(2)}</span>
                  </div>
                )}
                {item.ultima_compra && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Última compra:</span>
                    <span className="font-medium">
                      {new Date(item.ultima_compra).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant={item.is_principal ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTogglePrincipal(item.id, item.is_principal)}
                    className="flex-1"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {item.is_principal ? "Principal" : "Marcar principal"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <VincularProdutoModal
        open={showModal}
        onOpenChange={setShowModal}
        fornecedorId={fornecedorId}
        onSuccess={loadProdutos}
      />
    </div>
  );
}

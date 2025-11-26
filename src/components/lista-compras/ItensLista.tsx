import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ItensListaProps {
  listaId: string;
  refreshKey: number;
}

interface ItemLista {
  id: string;
  quantidade: number;
  produto_id: string;
  produtos: {
    codigo: string;
    descricao: string;
    unidade_venda: string;
  };
  fornecedor_sugerido_id: string | null;
  fornecedores?: {
    razao_social: string;
    nome_fantasia: string | null;
  } | null;
}

export function ItensLista({ listaId, refreshKey }: ItensListaProps) {
  const { toast } = useToast();
  const [itens, setItens] = useState<ItemLista[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantidade, setEditQuantidade] = useState("");

  useEffect(() => {
    loadItens();
  }, [listaId, refreshKey]);

  const loadItens = async () => {
    try {
      const { data, error } = await supabase
        .from("itens_lista_compras")
        .select(`
          *,
          produtos:produto_id(codigo, descricao, unidade_venda),
          fornecedores!itens_lista_compras_fornecedor_sugerido_id_fkey(razao_social, nome_fantasia)
        `)
        .eq("lista_id", listaId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setItens(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removerItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("itens_lista_compras")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Item removido",
        description: "Item removido da lista com sucesso",
      });

      loadItens();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const iniciarEdicao = (item: ItemLista) => {
    setEditingId(item.id);
    setEditQuantidade(item.quantidade.toString());
  };

  const salvarEdicao = async (itemId: string) => {
    try {
      const quantidade = parseFloat(editQuantidade);
      if (isNaN(quantidade) || quantidade <= 0) {
        toast({
          title: "Erro",
          description: "Quantidade inválida",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("itens_lista_compras")
        .update({ quantidade })
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Quantidade atualizada",
      });

      setEditingId(null);
      loadItens();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const cancelarEdicao = () => {
    setEditingId(null);
    setEditQuantidade("");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Carregando itens...</p>
        </CardContent>
      </Card>
    );
  }

  if (itens.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            Nenhum item na lista. Clique em "Adicionar Item" para começar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {itens.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">
                    {item.produtos.codigo} - {item.produtos.descricao}
                  </span>
                  <Badge variant="outline">{item.produtos.unidade_venda}</Badge>
                </div>
                {item.fornecedores && (
                  <p className="text-sm text-muted-foreground">
                    Fornecedor: {item.fornecedores.nome_fantasia || item.fornecedores.razao_social}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editingId === item.id ? (
                  <>
                    <Input
                      type="number"
                      step="0.01"
                      value={editQuantidade}
                      onChange={(e) => setEditQuantidade(e.target.value)}
                      className="w-24"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") salvarEdicao(item.id);
                        if (e.key === "Escape") cancelarEdicao();
                      }}
                    />
                    <Button size="sm" onClick={() => salvarEdicao(item.id)}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelarEdicao}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <div 
                      className="text-lg font-semibold cursor-pointer hover:bg-muted px-3 py-1 rounded"
                      onClick={() => iniciarEdicao(item)}
                      title="Clique para editar"
                    >
                      {item.quantidade} {item.produtos.unidade_venda}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removerItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

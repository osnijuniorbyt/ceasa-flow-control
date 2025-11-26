import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  unidade_venda: string;
}

interface VincularProdutoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedorId: string;
  onSuccess: () => void;
}

export function VincularProdutoModal({
  open,
  onOpenChange,
  fornecedorId,
  onSuccess,
}: VincularProdutoModalProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [precoHabitual, setPrecoHabitual] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && busca.length >= 2) {
      searchProdutos();
    } else {
      setProdutos([]);
    }
  }, [busca, open]);

  const searchProdutos = async () => {
    try {
      // Buscar produtos que ainda não estão vinculados a este fornecedor
      const { data: vinculados } = await supabase
        .from("fornecedor_produtos")
        .select("produto_id")
        .eq("fornecedor_id", fornecedorId);

      const idsVinculados = vinculados?.map(v => v.produto_id) || [];

      const { data, error } = await supabase
        .from("produtos")
        .select("id, codigo, descricao, unidade_venda")
        .eq("ativo", true)
        .or(`codigo.ilike.%${busca}%,descricao.ilike.%${busca}%`)
        .not("id", "in", `(${idsVinculados.join(",")})`)
        .limit(10);

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const handleVincular = async () => {
    if (!produtoSelecionado) {
      toast({
        title: "Erro",
        description: "Selecione um produto",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("fornecedor_produtos")
        .insert({
          fornecedor_id: fornecedorId,
          produto_id: produtoSelecionado.id,
          preco_habitual: precoHabitual ? parseFloat(precoHabitual) : null,
          is_principal: false,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Produto vinculado com sucesso",
      });

      setProdutoSelecionado(null);
      setBusca("");
      setPrecoHabitual("");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao vincular:", error);
      toast({
        title: "Erro",
        description: "Erro ao vincular produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProdutoSelecionado(null);
    setBusca("");
    setPrecoHabitual("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular Produto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!produtoSelecionado ? (
            <>
              <div className="space-y-2">
                <Label>Buscar Produto</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Digite código ou nome..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {produtos.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {produtos.map((produto) => (
                    <button
                      key={produto.id}
                      onClick={() => setProdutoSelecionado(produto)}
                      className="w-full p-3 text-left bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                    >
                      <div className="font-medium">{produto.descricao}</div>
                      <div className="text-sm text-muted-foreground">
                        Cód: {produto.codigo} | {produto.unidade_venda}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="font-medium">{produtoSelecionado.descricao}</div>
                <div className="text-sm text-muted-foreground">
                  Cód: {produtoSelecionado.codigo} | {produtoSelecionado.unidade_venda}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco_habitual">Preço Habitual (opcional)</Label>
                <Input
                  id="preco_habitual"
                  type="number"
                  step="0.01"
                  value={precoHabitual}
                  onChange={(e) => setPrecoHabitual(e.target.value)}
                  placeholder="0,00"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setProdutoSelecionado(null)}
                  disabled={loading}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleVincular}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Vinculando...
                    </>
                  ) : (
                    "Vincular"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

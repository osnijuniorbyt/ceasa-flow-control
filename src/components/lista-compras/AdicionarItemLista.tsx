import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdicionarItemListaProps {
  listaId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  unidade_venda: string;
  fornecedor_padrao_id: string | null;
  fornecedores?: {
    id: string;
    razao_social: string;
    nome_fantasia: string | null;
  };
}

export function AdicionarItemLista({ listaId, onSuccess, onCancel }: AdicionarItemListaProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select(`
          *,
          fornecedores:fornecedor_padrao_id(id, razao_social, nome_fantasia)
        `)
        .eq("ativo", true)
        .order("descricao");

      if (error) throw error;
      setProdutos(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoSelecionado || !quantidade) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("itens_lista_compras").insert({
        lista_id: listaId,
        produto_id: produtoSelecionado.id,
        quantidade: parseFloat(quantidade),
        fornecedor_sugerido_id: produtoSelecionado.fornecedor_padrao_id,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item adicionado à lista!",
      });

      onSuccess();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Produto</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {produtoSelecionado
                    ? `${produtoSelecionado.codigo} - ${produtoSelecionado.descricao}`
                    : "Selecione um produto..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar produto..." />
                  <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {produtos.map((produto) => (
                      <CommandItem
                        key={produto.id}
                        value={`${produto.codigo} ${produto.descricao}`}
                        onSelect={() => {
                          setProdutoSelecionado(produto);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            produtoSelecionado?.id === produto.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {produto.codigo} - {produto.descricao}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {produto.unidade_venda}
                            {produto.fornecedores && 
                              ` • Fornecedor padrão: ${produto.fornecedores.nome_fantasia || produto.fornecedores.razao_social}`
                            }
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {produtoSelecionado && (
            <>
              <div className="space-y-2">
                <Label>Quantidade ({produtoSelecionado.unidade_venda})</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="Ex: 10"
                  required
                />
              </div>

              {produtoSelecionado.fornecedores && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Fornecedor sugerido:</p>
                  <p className="text-sm text-muted-foreground">
                    {produtoSelecionado.fornecedores.nome_fantasia || produtoSelecionado.fornecedores.razao_social}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !produtoSelecionado || !quantidade}>
              Adicionar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

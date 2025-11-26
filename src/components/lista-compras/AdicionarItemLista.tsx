import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X, Sparkles, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CriarProdutoModal } from "./CriarProdutoModal";

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
  categoria?: string;
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
  const [loadingSugestao, setLoadingSugestao] = useState(false);
  const [sugestao, setSugestao] = useState<{
    quantidade_sugerida: number;
    confianca: string;
    explicacao: string;
  } | null>(null);
  const [showCriarProduto, setShowCriarProduto] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [ordenacao, setOrdenacao] = useState<"nome" | "codigo">("nome");

  useEffect(() => {
    if (produtoSelecionado) {
      buscarSugestao();
    } else {
      setSugestao(null);
      setQuantidade("");
    }
  }, [produtoSelecionado]);

  const buscarSugestao = async () => {
    if (!produtoSelecionado) return;

    setLoadingSugestao(true);
    try {
      const { data, error } = await supabase.functions.invoke("sugerir-quantidade", {
        body: { produtoId: produtoSelecionado.id },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast({
            title: "Muitas requisições",
            description: "Aguarde alguns instantes e tente novamente",
            variant: "destructive",
          });
        } else if (error.message?.includes("402")) {
          toast({
            title: "Créditos esgotados",
            description: "Adicione créditos no workspace para continuar usando sugestões inteligentes",
            variant: "destructive",
          });
        } else {
          console.error("Erro ao buscar sugestão:", error);
        }
        return;
      }

      if (data && data.quantidade_sugerida) {
        setSugestao(data);
        setQuantidade(data.quantidade_sugerida.toString());
      }
    } catch (error) {
      console.error("Erro ao buscar sugestão:", error);
    } finally {
      setLoadingSugestao(false);
    }
  };

  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    try {
      const { data: grupos, error: gruposError } = await supabase
        .from("grupos")
        .select("id, nome");

      if (gruposError) throw gruposError;

      const grupoMap = new Map(grupos?.map(g => [g.id, g.nome.toLowerCase()]) || []);

      const { data, error } = await supabase
        .from("produtos")
        .select(`
          *,
          fornecedores:fornecedor_padrao_id(id, razao_social, nome_fantasia)
        `)
        .eq("ativo", true);

      if (error) throw error;

      // Mapear categoria baseado no grupo
      const produtosComCategoria = (data || []).map(p => ({
        ...p,
        categoria: grupoMap.get(p.grupo_id) || "outros"
      }));

      setProdutos(produtosComCategoria as any);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleProdutoCriado = async (produtoId: string) => {
    await loadProdutos();
    const produto = produtos.find((p) => p.id === produtoId);
    if (produto) {
      setProdutoSelecionado(produto);
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
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="space-y-2">
              <Label className="text-xs">Filtrar por Categoria</Label>
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="frutas">Frutas</SelectItem>
                  <SelectItem value="legumes">Legumes</SelectItem>
                  <SelectItem value="verduras">Verduras</SelectItem>
                  <SelectItem value="ovos">Ovos</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Ordenar por</Label>
              <Select value={ordenacao} onValueChange={(v) => setOrdenacao(v as "nome" | "codigo")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nome">Nome</SelectItem>
                  <SelectItem value="codigo">Código</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
                  <CommandInput 
                    placeholder="Buscar produto..." 
                    onValueChange={setSearchTerm}
                  />
                  <CommandEmpty>
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground mb-3">Produto não encontrado</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOpen(false);
                          setShowCriarProduto(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Produto "{searchTerm}"
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {produtos
                      .filter(p => categoriaFiltro === "todas" || p.categoria === categoriaFiltro)
                      .sort((a, b) => {
                        if (ordenacao === "nome") {
                          return a.descricao.localeCompare(b.descricao);
                        }
                        return a.codigo.localeCompare(b.codigo);
                      })
                      .map((produto) => (
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
                <div className="flex items-center justify-between">
                  <Label>Quantidade ({produtoSelecionado.unidade_venda})</Label>
                  {loadingSugestao && (
                    <Badge variant="outline" className="gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Analisando...
                    </Badge>
                  )}
                  {sugestao && !loadingSugestao && (
                    <Badge 
                      variant={
                        sugestao.confianca === "alta" 
                          ? "default" 
                          : sugestao.confianca === "media" 
                          ? "secondary" 
                          : "outline"
                      }
                      className="gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      Sugestão IA: {sugestao.quantidade_sugerida}
                    </Badge>
                  )}
                </div>
                <Input
                  type="number"
                  step="0.01"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="Ex: 10"
                  required
                />
                {sugestao && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {sugestao.explicacao}
                  </p>
                )}
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

      <CriarProdutoModal
        open={showCriarProduto}
        onOpenChange={setShowCriarProduto}
        onSuccess={handleProdutoCriado}
        searchTerm={searchTerm}
      />
    </Card>
  );
}

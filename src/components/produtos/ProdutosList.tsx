import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Edit, Power, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  unidade_venda: string;
  margem_padrao: number | null;
  preco_ultima_compra: number | null;
  ativo: boolean;
  grupos: {
    nome: string;
  };
  fornecedores: {
    razao_social: string;
    contato: string | null;
  } | null;
  vasilhames: {
    nome: string;
    peso_kg: number;
  } | null;
}

interface ProdutosListProps {
  onEdit: (id: string) => void;
}

export function ProdutosList({ onEdit }: ProdutosListProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [categorias, setCategorias] = useState<Array<{ id: string; nome: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadCategorias();
    loadProdutos();
  }, []);

  const loadCategorias = async () => {
    const { data } = await supabase
      .from("grupos")
      .select("id, nome")
      .eq("ativo", true)
      .order("nome");

    if (data) setCategorias(data);
  };

  const loadProdutos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select(`
          id,
          codigo,
          descricao,
          unidade_venda,
          margem_padrao,
          preco_ultima_compra,
          ativo,
          grupos!inner(nome),
          fornecedores:fornecedor_padrao_id(razao_social, contato),
          vasilhames!vasilhame_padrao_id(nome, peso_kg)
        `)
        .order("descricao");

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from("produtos")
        .update({ ativo: !ativo })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Produto ${!ativo ? "ativado" : "desativado"}`,
      });

      loadProdutos();
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto",
        variant: "destructive",
      });
    }
  };

  const produtosFiltrados = produtos.filter((p) => {
    const matchBusca =
      p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria =
      filtroCategoria === "todos" || p.grupos.nome === filtroCategoria;

    return matchBusca && matchCategoria;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          <div className="flex gap-4">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas categorias</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={cat.nome}>
                    {cat.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground mb-2">
        {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? "s" : ""}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {produtosFiltrados.map((produto) => (
          <Card key={produto.id} className={!produto.ativo ? "opacity-60" : ""}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{produto.descricao}</h3>
                  <p className="text-sm text-muted-foreground">Cód: {produto.codigo}</p>
                </div>
                <Badge variant={produto.ativo ? "default" : "secondary"}>
                  {produto.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoria:</span>
                  <span className="font-medium">{produto.grupos.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unidade:</span>
                  <span className="font-medium">{produto.unidade_venda}</span>
                </div>
                {produto.preco_ultima_compra && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Último preço:</span>
                    <span className="font-medium">
                      R$ {produto.preco_ultima_compra.toFixed(2)}
                    </span>
                  </div>
                )}
                {produto.margem_padrao && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margem:</span>
                    <span className="font-medium">{produto.margem_padrao}%</span>
                  </div>
                )}
                {produto.fornecedores && (
                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fornecedor:</span>
                      <span className="font-medium text-xs">
                        {produto.fornecedores.razao_social}
                      </span>
                    </div>
                    {produto.fornecedores.contato && (
                      <div className="text-[10px] text-muted-foreground text-right">
                        Box: {produto.fornecedores.contato}
                      </div>
                    )}
                  </div>
                )}
                {produto.vasilhames && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Embalagem:</span>
                    <span className="font-medium text-xs">
                      {produto.vasilhames.nome}
                      <span className="text-[10px] text-muted-foreground ml-1">
                        ({produto.vasilhames.peso_kg} kg)
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(produto.id)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant={produto.ativo ? "destructive" : "default"}
                  size="sm"
                  onClick={() => handleToggleAtivo(produto.id, produto.ativo)}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {produtosFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Nenhum produto encontrado
          </CardContent>
        </Card>
      )}
    </div>
  );
}

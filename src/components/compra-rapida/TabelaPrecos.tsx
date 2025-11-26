import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProdutoPreco {
  id: string;
  codigo: string;
  descricao: string;
  custo_unitario: number;
  margem: number;
  preco_venda: number;
  curva: "A" | "B" | "C";
  categoria: string;
  fornecedor: string;
}

export function TabelaPrecos() {
  const [produtos, setProdutos] = useState<ProdutoPreco[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [filtroCurva, setFiltroCurva] = useState<string>("todos");
  const [editandoMargem, setEditandoMargem] = useState<string | null>(null);
  const [novaMargemTemp, setNovaMargemTemp] = useState<string>("");
  
  const { toast } = useToast();

  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    setLoading(true);
    try {
      // Buscar produtos com suas últimas compras
      const { data: produtosData, error: produtosError } = await supabase
        .from("produtos")
        .select(`
          id,
          codigo,
          descricao,
          preco_ultima_compra,
          margem_padrao,
          grupos!inner(nome),
          itens_compra!inner(
            preco_por_kg,
            compras!inner(
              data_compra,
              fornecedores(razao_social)
            )
          )
        `)
        .eq("ativo", true)
        .order("descricao");

      if (produtosError) throw produtosError;

      // Processar dados
      const produtosProcessados: ProdutoPreco[] = (produtosData || []).map((p: any) => {
        const custoUnitario = p.preco_ultima_compra || 0;
        const margem = p.margem_padrao || 30;
        const precoVenda = custoUnitario * (1 + margem / 100);
        
        // Pegar último fornecedor
        const ultimaCompra = p.itens_compra?.[0]?.compras;
        const fornecedor = ultimaCompra?.fornecedores?.razao_social || "N/A";
        
        return {
          id: p.id,
          codigo: p.codigo,
          descricao: p.descricao,
          custo_unitario: custoUnitario,
          margem: margem,
          preco_venda: precoVenda,
          curva: "B", // Será calculado depois
          categoria: p.grupos?.nome || "Sem categoria",
          fornecedor: fornecedor,
        };
      });

      // Calcular curva ABC baseado em valor (preço_venda * quantidade vendida simulada)
      const produtosComValor = produtosProcessados.map(p => ({
        ...p,
        valor_total: p.preco_venda * Math.random() * 100, // Simulado - idealmente seria vendas reais
      }));

      produtosComValor.sort((a, b) => b.valor_total - a.valor_total);
      
      const total = produtosComValor.reduce((sum, p) => sum + p.valor_total, 0);
      let acumulado = 0;
      
      produtosComValor.forEach((p, index) => {
        acumulado += p.valor_total;
        const percentualAcumulado = (acumulado / total) * 100;
        
        if (percentualAcumulado <= 20) {
          p.curva = "A";
        } else if (percentualAcumulado <= 50) {
          p.curva = "B";
        } else {
          p.curva = "C";
        }
      });

      setProdutos(produtosComValor);
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

  const handleSalvarMargem = async (produtoId: string, novaMargem: number) => {
    try {
      const { error } = await supabase
        .from("produtos")
        .update({ margem_padrao: novaMargem })
        .eq("id", produtoId);

      if (error) throw error;

      // Atualizar estado local
      setProdutos(produtos.map(p => {
        if (p.id === produtoId) {
          const novoPrecoVenda = p.custo_unitario * (1 + novaMargem / 100);
          return { ...p, margem: novaMargem, preco_venda: novoPrecoVenda };
        }
        return p;
      }));

      toast({
        title: "Sucesso",
        description: "Margem atualizada",
      });
    } catch (error) {
      console.error("Erro ao salvar margem:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar margem",
        variant: "destructive",
      });
    }
    
    setEditandoMargem(null);
    setNovaMargemTemp("");
  };

  const produtosFiltrados = produtos.filter(p => {
    const matchBusca = p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                       p.codigo.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = filtroCategoria === "todos" || p.categoria === filtroCategoria;
    const matchCurva = filtroCurva === "todos" || p.curva === filtroCurva;
    
    return matchBusca && matchCategoria && matchCurva;
  });

  const categorias = Array.from(new Set(produtos.map(p => p.categoria)));

  const handleExportar = () => {
    // Criar CSV
    const headers = ["Código", "Produto", "Custo Unit.", "Margem %", "Preço Venda", "Curva", "Categoria", "Fornecedor"];
    const rows = produtosFiltrados.map(p => [
      p.codigo,
      p.descricao,
      p.custo_unitario.toFixed(2),
      p.margem.toFixed(0),
      p.preco_venda.toFixed(2),
      p.curva,
      p.categoria,
      p.fornecedor,
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tabela-precos-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exportado",
      description: "Tabela exportada com sucesso",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="h-14 pl-11 text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas categorias</SelectItem>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filtroCurva} onValueChange={setFiltroCurva}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Curva" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas curvas</SelectItem>
                  <SelectItem value="A">Curva A</SelectItem>
                  <SelectItem value="B">Curva B</SelectItem>
                  <SelectItem value="C">Curva C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExportar} className="h-12" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>
            {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold">Produto</th>
                  <th className="text-right p-4 font-semibold">Custo Unit.</th>
                  <th className="text-right p-4 font-semibold">Margem %</th>
                  <th className="text-right p-4 font-semibold">Preço Venda</th>
                  <th className="text-center p-4 font-semibold">Curva</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((produto) => (
                  <tr key={produto.id} className="border-t hover:bg-muted/30">
                    <td className="p-4">
                      <div className="font-medium">{produto.descricao}</div>
                      <div className="text-sm text-muted-foreground">{produto.codigo}</div>
                    </td>
                    <td className="text-right p-4 font-mono">
                      R$ {produto.custo_unitario.toFixed(2)}
                    </td>
                    <td className="text-right p-4">
                      {editandoMargem === produto.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Input
                            type="number"
                            value={novaMargemTemp}
                            onChange={(e) => setNovaMargemTemp(e.target.value)}
                            className="w-20 h-8 text-right"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSalvarMargem(produto.id, parseFloat(novaMargemTemp));
                              }
                              if (e.key === "Escape") {
                                setEditandoMargem(null);
                                setNovaMargemTemp("");
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSalvarMargem(produto.id, parseFloat(novaMargemTemp))}
                            className="h-8"
                          >
                            OK
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditandoMargem(produto.id);
                            setNovaMargemTemp(produto.margem.toString());
                          }}
                          className="hover:bg-muted px-3 py-1 rounded font-mono"
                        >
                          {produto.margem.toFixed(0)}%
                        </button>
                      )}
                    </td>
                    <td className="text-right p-4 font-mono font-semibold text-primary">
                      R$ {produto.preco_venda.toFixed(2)}
                    </td>
                    <td className="text-center p-4">
                      <Badge
                        variant={
                          produto.curva === "A" ? "default" :
                          produto.curva === "B" ? "secondary" :
                          "outline"
                        }
                      >
                        {produto.curva}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

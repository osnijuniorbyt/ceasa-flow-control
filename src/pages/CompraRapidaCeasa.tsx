import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BuscaProdutoInteligente } from "@/components/compras-ceasa/BuscaProdutoInteligente";
import { InputNumericoMobile } from "@/components/compras-ceasa/InputNumericoMobile";
import { ShoppingCart, Truck, List, Plus, Trash2, Save, History } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ItemCarrinho {
  produto_id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: string;
  valor_total: string;
}

const CACHE_KEY = "compra_ceasa_em_andamento";

export default function CompraRapidaCeasa() {
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<string>("");
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [quantidade, setQuantidade] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Carregar cache ao montar
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setFornecedorSelecionado(data.fornecedor || "");
        setCarrinho(data.carrinho || []);
        toast.info("Compra em andamento restaurada");
      } catch (e) {
        console.error("Erro ao carregar cache:", e);
      }
    }
  }, []);

  // Salvar cache sempre que mudar
  useEffect(() => {
    if (fornecedorSelecionado || carrinho.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        fornecedor: fornecedorSelecionado,
        carrinho: carrinho
      }));
    }
  }, [fornecedorSelecionado, carrinho]);

  // Buscar produtos do histórico do fornecedor
  const { data: produtosHistorico } = useQuery({
    queryKey: ["produtos-fornecedor-historico", fornecedorSelecionado],
    queryFn: async () => {
      if (!fornecedorSelecionado) return [];

      // Buscar últimas compras deste fornecedor
      const { data: compras, error } = await supabase
        .from("compras")
        .select(`
          id,
          itens_compra (
            produto_id,
            peso_total_kg,
            subtotal,
            preco_por_kg,
            produtos (
              id,
              codigo,
              descricao,
              unidade_venda
            )
          )
        `)
        .eq("fornecedor_id", fornecedorSelecionado)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Agrupar produtos por frequência
      const produtosMap = new Map();
      
      compras?.forEach((compra: any) => {
        compra.itens_compra?.forEach((item: any) => {
          if (item.produtos) {
            const pid = item.produtos.id;
            if (!produtosMap.has(pid)) {
              produtosMap.set(pid, {
                ...item.produtos,
                vezes_comprado: 0,
                ultima_quantidade: 0,
                ultimo_valor: 0,
              });
            }
            const p = produtosMap.get(pid);
            p.vezes_comprado += 1;
            p.ultima_quantidade = item.peso_total_kg;
            p.ultimo_valor = item.subtotal;
          }
        });
      });

      return Array.from(produtosMap.values())
        .sort((a, b) => b.vezes_comprado - a.vezes_comprado);
    },
    enabled: !!fornecedorSelecionado,
  });

  const { data: fornecedores } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("*")
        .eq("ativo", true)
        .order("nome_fantasia");
      if (error) throw error;
      return data;
    },
  });

  const { data: vasilhames } = useQuery({
    queryKey: ["vasilhames"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vasilhames")
        .select("*")
        .eq("ativo", true);
      if (error) throw error;
      return data || [];
    },
  });

  const salvarCompraMutation = useMutation({
    mutationFn: async () => {
      if (!fornecedorSelecionado) {
        throw new Error("Selecione um fornecedor");
      }

      if (carrinho.length === 0) {
        throw new Error("Adicione produtos ao carrinho");
      }

      // Calcular total
      const valorTotalCompra = carrinho.reduce((sum, item) => 
        sum + parseFloat(item.valor_total || "0"), 0
      );

      // Criar compra (trigger gera numero_compra automaticamente)
      const { data: compra, error: compraError } = await supabase
        .from("compras")
        .insert([{
          fornecedor_id: fornecedorSelecionado,
          valor_produtos: valorTotalCompra,
          valor_total: valorTotalCompra,
          status: "confirmado",
          numero_compra: 1, // Será substituído pelo trigger
        }])
        .select()
        .single();

      if (compraError) {
        console.error("Erro ao criar compra:", compraError);
        throw compraError;
      }

      // Pegar primeiro vasilhame disponível como padrão
      const vasilhamePadrao = vasilhames?.[0]?.id;
      if (!vasilhamePadrao) {
        throw new Error("Nenhum vasilhame cadastrado");
      }

      // Criar itens da compra
      const itens = carrinho.map((item) => {
        const qtd = parseFloat(item.quantidade || "1");
        const valor = parseFloat(item.valor_total || "0");
        const pesoKg = qtd; // Simplificado: assume que quantidade = peso

        return {
          compra_id: compra.id,
          produto_id: item.produto_id,
          vasilhame_id: vasilhamePadrao,
          quantidade_vasilhames: qtd,
          peso_total_kg: pesoKg,
          preco_por_vasilhame: valor,
          preco_por_kg: pesoKg > 0 ? valor / pesoKg : 0,
          subtotal: valor,
        };
      });

      const { error: itensError } = await supabase
        .from("itens_compra")
        .insert(itens);

      if (itensError) {
        console.error("Erro ao criar itens:", itensError);
        throw itensError;
      }

      return compra;
    },
    onSuccess: (compra) => {
      toast.success(`Compra #${compra.numero_compra} salva com sucesso!`);
      // Limpar cache
      localStorage.removeItem(CACHE_KEY);
      setCarrinho([]);
      setQuantidade("");
      setValorTotal("");
      setFornecedorSelecionado("");
      setProdutoSelecionado(null);
      queryClient.invalidateQueries({ queryKey: ["compras"] });
      queryClient.invalidateQueries({ queryKey: ["produtos-fornecedor-historico"] });
      navigate(`/compra-rapida/${compra.id}`);
    },
    onError: (error: any) => {
      console.error("Erro detalhado:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  const adicionarProdutoHistorico = (produto: any) => {
    setProdutoSelecionado(produto);
    setQuantidade(produto.ultima_quantidade?.toString() || "");
    setValorTotal(produto.ultimo_valor?.toString() || "");
    setTimeout(() => {
      document.getElementById("quantidade-input")?.focus();
    }, 100);
  };

  const adicionarAoCarrinho = () => {
    if (!produtoSelecionado) {
      toast.error("Selecione um produto");
      return;
    }

    if (!quantidade || parseFloat(quantidade) <= 0) {
      toast.error("Digite a quantidade");
      return;
    }

    if (!valorTotal || parseFloat(valorTotal) <= 0) {
      toast.error("Digite o valor total");
      return;
    }

    const novoItem: ItemCarrinho = {
      produto_id: produtoSelecionado.id,
      codigo: produtoSelecionado.codigo,
      descricao: produtoSelecionado.descricao,
      unidade: produtoSelecionado.unidade_venda,
      quantidade: quantidade,
      valor_total: valorTotal,
    };

    setCarrinho([...carrinho, novoItem]);
    setProdutoSelecionado(null);
    setQuantidade("");
    setValorTotal("");
    toast.success(`${produtoSelecionado.descricao} adicionado!`);
  };

  const removerDoCarrinho = (index: number) => {
    setCarrinho(carrinho.filter((_, i) => i !== index));
    toast.success("Item removido");
  };

  const totalCarrinho = carrinho.reduce((sum, item) => 
    sum + parseFloat(item.valor_total || "0"), 0
  );

  return (
    <div className="min-h-screen pb-24 p-4 space-y-4">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShoppingCart className="h-8 w-8" />
          Compra CEASA
        </h1>
        <p className="text-lg mt-1 opacity-90">Lançamento rápido e prático</p>
      </div>

      {/* Seleção de Fornecedor */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Truck className="h-5 w-5" />
            Fornecedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={fornecedorSelecionado} onValueChange={setFornecedorSelecionado}>
            <SelectTrigger className="h-14 text-lg border-2">
              <SelectValue placeholder="Selecione o fornecedor" />
            </SelectTrigger>
            <SelectContent>
              {fornecedores?.map((f) => (
                <SelectItem key={f.id} value={f.id} className="text-lg py-3">
                  {f.nome_fantasia || f.razao_social}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Histórico de Produtos do Fornecedor */}
      {fornecedorSelecionado && produtosHistorico && produtosHistorico.length > 0 && (
        <Card className="border-2 border-blue-500/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <History className="h-5 w-5" />
              Produtos Recentes ({produtosHistorico.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground mb-3">
              Clique para adicionar rápido
            </div>
            {produtosHistorico.slice(0, 5).map((produto: any) => (
              <button
                key={produto.id}
                onClick={() => adicionarProdutoHistorico(produto)}
                className="w-full p-3 border-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-base">
                      {produto.codigo} - {produto.descricao}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                      <span>Comprado {produto.vezes_comprado}x</span>
                      <span>•</span>
                      <span>Último: {produto.ultima_quantidade} {produto.unidade_venda}</span>
                      <span>•</span>
                      <span className="text-green-600 font-semibold">
                        R$ {Number(produto.ultimo_valor).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Plus className="h-5 w-5 text-primary" />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Busca de Produto */}
      {fornecedorSelecionado && (
        <Card className="border-2 border-primary/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Buscar Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BuscaProdutoInteligente
              onSelectProduto={(produto) => {
                setProdutoSelecionado(produto);
                // Após selecionar, focar no campo de quantidade
                setTimeout(() => {
                  document.getElementById("quantidade-input")?.focus();
                }, 100);
              }}
              placeholder="Digite código (ex: 162) ou nome (ex: batata)"
            />

            {produtoSelecionado && (
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="pt-4">
                  <div className="font-bold text-lg">
                    {produtoSelecionado.codigo} - {produtoSelecionado.descricao}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Un: {produtoSelecionado.unidade_venda}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div id="quantidade-input">
                <InputNumericoMobile
                  label="Quantidade"
                  value={quantidade}
                  onChange={setQuantidade}
                  placeholder="0"
                />
              </div>

              <InputNumericoMobile
                label="Valor Total"
                value={valorTotal}
                onChange={setValorTotal}
                placeholder="0,00"
                prefix="R$"
              />
            </div>

            <Button
              size="lg"
              className="w-full h-16 text-xl font-bold"
              onClick={adicionarAoCarrinho}
              disabled={!produtoSelecionado || !quantidade || !valorTotal}
            >
              <Plus className="h-6 w-6 mr-2" />
              Adicionar ao Carrinho
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Carrinho */}
      {carrinho.length > 0 && (
        <Card className="border-2 border-green-500/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-xl">
              <span className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Carrinho ({carrinho.length})
              </span>
              <span className="text-2xl font-bold text-green-600">
                R$ {totalCarrinho.toFixed(2)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {carrinho.map((item, index) => (
              <div
                key={index}
                className="bg-muted/50 p-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-bold text-lg">
                    {item.codigo} - {item.descricao}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {item.quantidade} {item.unidade} • R$ {parseFloat(item.valor_total).toFixed(2)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removerDoCarrinho(index)}
                  className="h-12 w-12"
                >
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            ))}

            <Button
              size="lg"
              className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-700"
              onClick={() => salvarCompraMutation.mutate()}
              disabled={salvarCompraMutation.isPending}
            >
              <Save className="h-6 w-6 mr-2" />
              {salvarCompraMutation.isPending ? "Salvando..." : "Finalizar Compra"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
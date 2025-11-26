import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BuscaProdutoInteligente } from "@/components/compras-ceasa/BuscaProdutoInteligente";
import { InputNumericoMobile } from "@/components/compras-ceasa/InputNumericoMobile";
import { NovoFornecedorModal } from "@/components/compra-rapida/NovoFornecedorModal";
import { SwipeableHistoricoItem } from "@/components/compras-ceasa/SwipeableHistoricoItem";
import { SwipeableCarrinhoItem } from "@/components/compras-ceasa/SwipeableCarrinhoItem";
import { ConferenciaMobile } from "@/components/compras-ceasa/ConferenciaMobile";
import { PrecificacaoMobile } from "@/components/compras-ceasa/PrecificacaoMobile";
import { ComparativoLotes } from "@/components/compras-ceasa/ComparativoLotes";
import { Apple, Truck, List, Plus, Trash2, Save, History, X, ClipboardCheck, DollarSign, FileText } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [activeTab, setActiveTab] = useState("lancamento");
  const [loteData, setLoteData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<string>("");
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [quantidade, setQuantidade] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [novoFornecedorModalOpen, setNovoFornecedorModalOpen] = useState(false);
  const [cancelarDialogOpen, setCancelarDialogOpen] = useState(false);
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
        .limit(20);

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

    const novoItem: ItemCarrinho = {
      produto_id: produtoSelecionado.id,
      codigo: produtoSelecionado.codigo,
      descricao: produtoSelecionado.descricao,
      unidade: produtoSelecionado.unidade_venda,
      quantidade: quantidade,
      valor_total: valorTotal || "0",
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

  const cancelarCompra = () => {
    if (carrinho.length > 0) {
      setCancelarDialogOpen(true);
    } else {
      limparCampos();
    }
  };

  const limparCampos = () => {
    setCarrinho([]);
    setQuantidade("");
    setValorTotal("");
    setProdutoSelecionado(null);
    setCancelarDialogOpen(false);
    toast.success("Campos limpos");
  };

  const limparTudo = () => {
    localStorage.removeItem(CACHE_KEY);
    limparCampos();
    setFornecedorSelecionado("");
    navigate("/");
  };

  const totalCarrinho = carrinho.reduce((sum, item) => 
    sum + parseFloat(item.valor_total || "0"), 0
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header Compacto */}
      <div className="bg-black text-white p-3 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Apple className="h-7 w-7 text-orange-500 fill-orange-500" />
            HORTII
          </h1>
          {activeTab === "lancamento" && fornecedorSelecionado && (
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelarCompra}
              className="text-white hover:bg-white/20 h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12 sticky top-[52px] z-10 rounded-none border-b bg-background">
          <TabsTrigger value="lancamento" className="text-xs gap-1">
            <Apple className="h-4 w-4" />
            Lançar
          </TabsTrigger>
          <TabsTrigger value="conferencia" className="text-xs gap-1">
            <ClipboardCheck className="h-4 w-4" />
            Conferir
          </TabsTrigger>
          <TabsTrigger value="precificacao" className="text-xs gap-1">
            <DollarSign className="h-4 w-4" />
            Preços
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="text-xs gap-1">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lancamento" className="mt-0">
          <div className="space-y-2 p-2">{/* ... keep existing code */}

      {/* Seleção de Fornecedor */}
      <Card className="border">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4" />
            Fornecedor
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="flex gap-2 items-center">
            <Select value={fornecedorSelecionado} onValueChange={setFornecedorSelecionado}>
              <SelectTrigger className="h-12 text-base border-2">
                <SelectValue placeholder="Selecione o fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {fornecedores?.map((f) => (
                  <SelectItem key={f.id} value={f.id} className="text-base py-2">
                    {f.nome_fantasia || f.razao_social}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="icon"
              className="h-12 w-12 flex-shrink-0"
              onClick={() => setNovoFornecedorModalOpen(true)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Produtos do Fornecedor - COMPACTO COM SCROLL */}
      {fornecedorSelecionado && produtosHistorico && produtosHistorico.length > 0 && (
        <Card className="border border-blue-500/30">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <History className="h-4 w-4" />
              Histórico ({produtosHistorico.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
              {produtosHistorico.map((produto: any) => (
                <SwipeableHistoricoItem
                  key={produto.id}
                  produto={produto}
                  fornecedorId={fornecedorSelecionado}
                  onSelect={adicionarProdutoHistorico}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Busca de Produto - COMPACTO */}
      {fornecedorSelecionado && (
        <Card className="border border-primary/30">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-base">Buscar Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3">
            <BuscaProdutoInteligente
              onSelectProduto={(produto) => {
                setProdutoSelecionado(produto);
                setTimeout(() => {
                  document.getElementById("quantidade-input")?.focus();
                }, 100);
              }}
              placeholder="Código ou nome"
            />

            {produtoSelecionado && (
              <div className="bg-primary/10 border border-primary/30 p-2 rounded-lg">
                <div className="font-semibold text-sm">
                  {produtoSelecionado.codigo} - {produtoSelecionado.descricao}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div id="quantidade-input">
                <InputNumericoMobile
                  label="Qtd"
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
              className="w-full h-12 text-base font-bold"
              onClick={adicionarAoCarrinho}
              disabled={!produtoSelecionado || !quantidade}
            >
              <Plus className="h-5 w-5 mr-2" />
              Adicionar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Carrinho - COMPACTO */}
      {carrinho.length > 0 && (
        <Card className="border border-green-500/30">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Carrinho ({carrinho.length})
              </span>
              <span className="text-xl font-bold text-green-600">
                R$ {totalCarrinho.toFixed(2)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 px-3 pb-3">
            {carrinho.map((item, index) => (
              <SwipeableCarrinhoItem
                key={index}
                item={item}
                index={index}
                onRemove={removerDoCarrinho}
              />
            ))}

            <Button
              size="lg"
              className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700 mt-2"
              onClick={() => salvarCompraMutation.mutate()}
              disabled={salvarCompraMutation.isPending}
            >
              <Save className="h-5 w-5 mr-2" />
              {salvarCompraMutation.isPending ? "Salvando..." : "Finalizar"}
            </Button>
          </CardContent>
        </Card>
      )}
          </div>
        </TabsContent>

        <TabsContent value="conferencia" className="mt-0">
          <ConferenciaMobile loteData={loteData} onLoteDataChange={setLoteData} />
        </TabsContent>

        <TabsContent value="precificacao" className="mt-0">
          <PrecificacaoMobile loteData={loteData} onLoteDataChange={setLoteData} />
        </TabsContent>

        <TabsContent value="relatorios" className="mt-0">
          <ComparativoLotes />
        </TabsContent>
      </Tabs>

      {/* Modal Novo Fornecedor */}
      <NovoFornecedorModal
        open={novoFornecedorModalOpen}
        onOpenChange={setNovoFornecedorModalOpen}
        onSuccess={(fornecedorId) => {
          setFornecedorSelecionado(fornecedorId);
          queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
        }}
      />

      {/* Dialog de Confirmação */}
      <AlertDialog open={cancelarDialogOpen} onOpenChange={setCancelarDialogOpen}>
        <AlertDialogContent className="w-[90vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar Lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem {carrinho.length} {carrinho.length === 1 ? "item" : "itens"} no carrinho.
              Deseja limpar o carrinho atual? O fornecedor permanecerá selecionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="h-12 text-base">Não</AlertDialogCancel>
            <AlertDialogAction onClick={limparCampos} className="h-12 text-base">
              Sim, Limpar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BuscaProdutoInteligente } from "@/components/compras-ceasa/BuscaProdutoInteligente";
import { InputNumericoMobile } from "@/components/compras-ceasa/InputNumericoMobile";
import { NovoFornecedorModal } from "@/components/compra-rapida/NovoFornecedorModal";
import { Label } from "@/components/ui/label";
import { SwipeableHistoricoItem } from "@/components/compras-ceasa/SwipeableHistoricoItem";
import { SwipeableCarrinhoItem } from "@/components/compras-ceasa/SwipeableCarrinhoItem";
import { ConferenciaMobile } from "@/components/compras-ceasa/ConferenciaMobile";
import { PrecificacaoMobile } from "@/components/compras-ceasa/PrecificacaoMobile";
import { HistoricoLote } from "@/components/compras-ceasa/HistoricoLote";
import { Truck, List, Plus, Trash2, Save, History, X, ClipboardCheck, DollarSign, Package, Settings } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProdutoForm } from "@/components/produtos/ProdutoForm";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";

interface ItemCarrinho {
  produto_id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: string;
  valor_total: string;
  vasilhame_id: string;
  vasilhame_nome: string;
  peso_unitario_kg: number;
  peso_total_kg: number;
}

const CACHE_KEY = "compra_ceasa_em_andamento";

export default function CompraRapidaCeasa() {
  const [activeTab, setActiveTab] = useState("lancamento");
  const [loteData, setLoteData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<string>("");
  const [tipoFornecedorFiltro, setTipoFornecedorFiltro] = useState<string>(() => {
    return localStorage.getItem("tipo_fornecedor_filtro") || "TODOS";
  });
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [vasilhameSelecionado, setVasilhameSelecionado] = useState<string>("padrao");
  
  // Carrinho com persistência offline
  const { 
    value: carrinho, 
    setValue: setCarrinho, 
    isOnline 
  } = useOfflineStorage<ItemCarrinho[]>('carrinho_compra_ceasa', []);
  
  // Garantir que carrinho seja sempre um array
  const carrinhoArray = Array.isArray(carrinho) ? carrinho : [];
  
  // Sincronização offline
  useOfflineSync();
  
  const [quantidade, setQuantidade] = useState("");
  const [valorPorCaixa, setValorPorCaixa] = useState("");
  const [novoFornecedorModalOpen, setNovoFornecedorModalOpen] = useState(false);
  const [novoProdutoModalOpen, setNovoProdutoModalOpen] = useState(false);
  const [vasilhameManualId, setVasilhameManualId] = useState<string>("");
  const [cancelarDialogOpen, setCancelarDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Carregar cache ao montar
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    const ultimoFornecedor = localStorage.getItem("ultimo_fornecedor");
    
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setFornecedorSelecionado(data.fornecedor || "");
        setCarrinho(data.carrinho || []);
        toast.info("Compra em andamento restaurada");
      } catch (e) {
        console.error("Erro ao carregar cache:", e);
      }
    } else if (ultimoFornecedor && !fornecedorSelecionado) {
      // Se não tem compra em andamento, usa o último fornecedor
      setFornecedorSelecionado(ultimoFornecedor);
    }
  }, []);

  // Salvar cache sempre que mudar
  useEffect(() => {
    if (fornecedorSelecionado || carrinhoArray.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        fornecedor: fornecedorSelecionado,
        carrinho: carrinhoArray
      }));
    }
  }, [fornecedorSelecionado, carrinhoArray]);

  // Buscar todos os vasilhames disponíveis
  const { data: todosVasilhames = [] } = useQuery({
    queryKey: ["vasilhames-todos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vasilhames")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      
      if (error) throw error;
      return data || [];
    },
  });

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
              unidade_venda,
              vasilhame_padrao:vasilhames!produtos_vasilhame_padrao_id_fkey (
                id,
                nome,
                peso_kg
              ),
              vasilhame_secundario:vasilhames!produtos_vasilhame_secundario_id_fkey (
                id,
                nome,
                peso_kg
              ),
              vasilhame_ultima_compra:vasilhames!produtos_vasilhame_ultima_compra_id_fkey (
                id,
                nome,
                peso_kg
              )
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
    queryKey: ["fornecedores", tipoFornecedorFiltro],
    queryFn: async () => {
      let query = supabase
        .from("fornecedores")
        .select("*")
        .eq("ativo", true)
        .order("nome_fantasia");
      
      if (tipoFornecedorFiltro !== "TODOS") {
        query = query.eq("tipo", tipoFornecedorFiltro);
      }
      
      const { data, error } = await query;
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
      // Se estiver offline, salva localmente
      if (!isOnline) {
        toast.warning('Sem conexão - compra será enviada quando voltar online');
        localStorage.setItem('compra_pendente', JSON.stringify({
          fornecedor: fornecedorSelecionado,
          carrinho: carrinhoArray,
          timestamp: Date.now()
        }));
        return { numero_compra: 'PENDENTE', pendente: true };
      }

      if (!fornecedorSelecionado) {
        throw new Error("Selecione um fornecedor");
      }

      if (carrinhoArray.length === 0) {
        throw new Error("Adicione produtos ao carrinho");
      }

      // Calcular total
      const valorTotalCompra = carrinhoArray.reduce((sum, item) => 
        sum + parseFloat(item.valor_total || "0"), 0
      );

      // Criar compra (trigger gera numero_compra automaticamente)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data: compra, error: compraError } = await supabase
        .from("compras")
        .insert([{
          fornecedor_id: fornecedorSelecionado,
          valor_produtos: valorTotalCompra,
          valor_total: valorTotalCompra,
          status: "confirmado",
          numero_compra: 1, // Será substituído pelo trigger
          user_id: user.id
        }])
        .select()
        .single();

      if (compraError) {
        console.error("Erro ao criar compra:", compraError);
        throw compraError;
      }

      // Pegar vasilhame de cada item do carrinho
      // Criar itens da compra
      const itens = carrinhoArray.map((item) => {
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

      if (itensError) {
        console.error("Erro ao criar itens:", itensError);
        throw itensError;
      }

      return compra;
    },
    onSuccess: (compra: any) => {
      if (compra?.pendente) {
        toast.info('Compra salva offline - será enviada automaticamente quando houver conexão');
        // Limpar cache mas não o carrinho (manter para quando sincronizar)
        localStorage.removeItem(CACHE_KEY);
      } else {
        toast.success(`Compra #${compra.numero_compra} salva com sucesso!`);
        // Limpar cache
        localStorage.removeItem(CACHE_KEY);
        setCarrinho([]);
        setQuantidade("");
        setValorPorCaixa("");
        setFornecedorSelecionado("");
        setProdutoSelecionado(null);
        queryClient.invalidateQueries({ queryKey: ["compras"] });
        queryClient.invalidateQueries({ queryKey: ["produtos-fornecedor-historico"] });
        navigate(`/compra-rapida/${compra.id}`);
      }
    },
    onError: (error: any) => {
      console.error("Erro detalhado:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  const adicionarProdutoHistorico = (produto: any) => {
    setProdutoSelecionado(produto);
    setQuantidade(produto.ultima_quantidade?.toString() || "");
    
    // Calcular valor por caixa baseado no histórico
    const qtd = parseFloat(produto.ultima_quantidade || "1");
    const valorTotal = parseFloat(produto.ultimo_valor || "0");
    const valorCaixa = qtd > 0 ? (valorTotal / qtd) : valorTotal;
    setValorPorCaixa(valorCaixa.toString());
    
    // Selecionar embalagem automaticamente baseado na prioridade
    if (produto.vasilhame_padrao) {
      setVasilhameSelecionado("padrao");
      setVasilhameManualId("");
    } else if (produto.vasilhame_secundario) {
      setVasilhameSelecionado("secundario");
      setVasilhameManualId("");
    } else if (produto.vasilhame_ultima_compra) {
      // Usar automaticamente a última embalagem usada
      setVasilhameSelecionado("manual");
      setVasilhameManualId(produto.vasilhame_ultima_compra.id);
    } else {
      setVasilhameSelecionado("");
      setVasilhameManualId("");
    }
    
    setTimeout(() => {
      document.getElementById("quantidade-input")?.focus();
    }, 100);
  };

  const adicionarAoCarrinho = async () => {
    if (!produtoSelecionado) {
      toast.error("Selecione um produto");
      return;
    }

    if (!quantidade || parseFloat(quantidade) <= 0) {
      toast.error("Digite a quantidade");
      return;
    }

    // Determinar qual vasilhame usar
    let vasilhameUsado: any = null;
    
    if (vasilhameSelecionado === "padrao" && produtoSelecionado.vasilhame_padrao) {
      vasilhameUsado = produtoSelecionado.vasilhame_padrao;
    } else if (vasilhameSelecionado === "secundario" && produtoSelecionado.vasilhame_secundario) {
      vasilhameUsado = produtoSelecionado.vasilhame_secundario;
    } else if (vasilhameSelecionado === "manual" && vasilhameManualId) {
      vasilhameUsado = todosVasilhames.find((v: any) => v.id === vasilhameManualId);
    }

    if (!vasilhameUsado) {
      toast.error("Selecione uma embalagem");
      return;
    }

    // Salvar a última embalagem usada no produto
    if (vasilhameSelecionado === "manual" && vasilhameManualId) {
      try {
        await supabase
          .from("produtos")
          .update({ vasilhame_ultima_compra_id: vasilhameManualId })
          .eq("id", produtoSelecionado.id);
      } catch (error) {
        console.error("Erro ao atualizar embalagem do produto:", error);
      }
    }

    const qtdCaixas = parseFloat(quantidade);
    const pesoUnitario = vasilhameUsado.peso_kg;
    const pesoTotal = qtdCaixas * pesoUnitario;
    const valorCaixa = parseFloat(valorPorCaixa || "0");
    const valorTotalCalculado = qtdCaixas * valorCaixa;

    const novoItem: ItemCarrinho = {
      produto_id: produtoSelecionado.id,
      codigo: produtoSelecionado.codigo,
      descricao: produtoSelecionado.descricao,
      unidade: produtoSelecionado.unidade_venda,
      quantidade: quantidade,
      valor_total: valorTotalCalculado.toString(),
      vasilhame_id: vasilhameUsado.id,
      vasilhame_nome: vasilhameUsado.nome,
      peso_unitario_kg: pesoUnitario,
      peso_total_kg: pesoTotal,
    };

    setCarrinho([...carrinhoArray, novoItem]);
    setProdutoSelecionado(null);
    setQuantidade("");
    setValorPorCaixa("");
    setVasilhameManualId("");
    toast.success(`${produtoSelecionado.descricao} adicionado! ${qtdCaixas}cx × R$ ${valorCaixa.toFixed(2)} = R$ ${valorTotalCalculado.toFixed(2)} (${pesoTotal}kg)`);
  };

  const removerDoCarrinho = (index: number) => {
    setCarrinho(carrinhoArray.filter((_, i) => i !== index));
    toast.success("Item removido");
  };

  const cancelarCompra = () => {
    if (carrinhoArray.length > 0) {
      setCancelarDialogOpen(true);
    } else {
      limparCampos();
    }
  };

  const limparCampos = () => {
    setCarrinho([]);
    setQuantidade("");
    setValorPorCaixa("");
    setProdutoSelecionado(null);
    setVasilhameManualId("");
    setCancelarDialogOpen(false);
    toast.success("Campos limpos");
  };

  const limparTudo = () => {
    localStorage.removeItem(CACHE_KEY);
    limparCampos();
    setFornecedorSelecionado("");
    navigate("/");
  };

  const totalCarrinho = carrinhoArray.reduce((sum, item) => 
    sum + parseFloat(item.valor_total || "0"), 0
  );

  return (
    <div className="min-h-screen pb-4 md:pb-6 bg-background">
      {/* Header - Full Width */}
      <div className="bg-black text-white py-4 md:py-5 sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-3 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 40 40" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 md:w-10 md:h-10"
            >
              <circle cx="20" cy="22" r="12" stroke="white" strokeWidth="2" fill="none" />
              <path d="M20 10 Q23 7 26 10 L25 12 Q22 10 20 12 Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
            </svg>
            <h1 className="text-3xl md:text-4xl font-light tracking-[0.3em]">
              HORTII
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/produtos-gestao")}
              className="text-white hover:bg-white/20 h-10 md:h-12 px-3 md:px-4"
            >
              <Settings className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Gestão</span>
            </Button>
            {activeTab === "lancamento" && fornecedorSelecionado && (
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelarCompra}
                className="text-white hover:bg-white/20 h-10 md:h-12"
              >
                <X className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Cancelar</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Container */}
      <div className="container mx-auto px-2 md:px-4">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sticky top-[60px] md:top-[68px] z-20 rounded-none border-b-2 bg-background shadow-sm h-14 md:h-16">
          <TabsTrigger value="lancamento" className="gap-2 text-base md:text-lg">
            <List className="h-6 w-6" />
            Lançar
          </TabsTrigger>
          <TabsTrigger value="conferencia" className="gap-2 text-base md:text-lg">
            <ClipboardCheck className="h-6 w-6" />
            Conferir
          </TabsTrigger>
          <TabsTrigger value="precificacao" className="gap-2 text-base md:text-lg">
            <DollarSign className="h-6 w-6" />
            Preços
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lancamento" className="mt-0 py-3 md:py-4">
          <div className="space-y-3 md:space-y-4">

      {/* Seleção de Fornecedor */}
      <Card className="border-2">
        <CardHeader className="pb-3 pt-3 px-3 md:px-6">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <Truck className="h-6 w-6 md:h-7 md:w-7" />
            Fornecedor
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6 pb-4 space-y-3">
          <div className="space-y-2">
            <Label className="text-base md:text-lg">Filtrar por tipo:</Label>
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {["TODOS", "PEDRA", "LOJAS", "OUTROS"].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => {
                    setTipoFornecedorFiltro(tipo);
                    localStorage.setItem("tipo_fornecedor_filtro", tipo);
                  }}
                  className={`p-4 md:p-5 font-medium rounded-xl border-2 transition-all min-h-[70px] md:min-h-[90px] ${
                    tipoFornecedorFiltro === tipo
                      ? "bg-primary text-primary-foreground border-primary shadow-lg"
                      : "bg-card border-border hover:border-primary/50 hover:shadow-md"
                  }`}
                >
                  <div className="text-3xl md:text-4xl">
                    {tipo === "PEDRA" && "🪨"}
                    {tipo === "LOJAS" && "🏪"}
                    {tipo === "OUTROS" && "📦"}
                    {tipo === "TODOS" && "🔍"}
                  </div>
                  <div className="text-sm md:text-base mt-1 font-semibold">{tipo}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <Select 
              value={fornecedorSelecionado} 
              onValueChange={(value) => {
                setFornecedorSelecionado(value);
                localStorage.setItem("ultimo_fornecedor", value);
              }}
            >
              <SelectTrigger className="h-16 md:h-20 text-lg md:text-xl border-2">
                <SelectValue placeholder="Selecione o fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {fornecedores?.map((f: any) => (
                  <SelectItem key={f.id} value={f.id} className="text-lg md:text-xl py-4 md:py-5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {f.tipo === "PEDRA" && "🪨"}
                        {f.tipo === "LOJAS" && "🏪"}
                        {f.tipo === "OUTROS" && "📦"}
                      </span>
                      <span className="font-semibold">{f.nome_fantasia || f.razao_social}</span>
                      {f.box && <span className="text-base text-muted-foreground">({f.box})</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="icon"
              className="h-16 md:h-20 w-16 md:w-20 flex-shrink-0"
              onClick={() => setNovoFornecedorModalOpen(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Produtos do Fornecedor */}
      {fornecedorSelecionado && produtosHistorico && produtosHistorico.length > 0 && (
        <Card className="border-2">
          <CardHeader className="pb-2 pt-3 px-3 md:px-6">
            <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
              <History className="h-6 w-6" />
              Histórico ({produtosHistorico.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-4 pb-3">
            <div className="space-y-2 max-h-[400px] md:max-h-[500px] overflow-y-auto">
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

      {/* Busca de Produto */}
      {fornecedorSelecionado && (
        <Card className="border-2">
          <CardHeader className="pb-2 pt-3 px-3 md:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl md:text-2xl">Buscar Produto</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNovoProdutoModalOpen(true)}
                className="h-12 md:h-14 text-base md:text-lg gap-2 px-4"
              >
                <Plus className="h-5 w-5" />
                Novo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-3 md:px-6 pb-3">
            <BuscaProdutoInteligente
              onSelectProduto={(produto) => {
                setProdutoSelecionado(produto);
                // Selecionar embalagem automaticamente baseado na prioridade
                if (produto.vasilhame_padrao) {
                  setVasilhameSelecionado("padrao");
                  setVasilhameManualId("");
                } else if (produto.vasilhame_secundario) {
                  setVasilhameSelecionado("secundario");
                  setVasilhameManualId("");
                } else if (produto.vasilhame_ultima_compra) {
                  // Usar automaticamente a última embalagem usada
                  setVasilhameSelecionado("manual");
                  setVasilhameManualId(produto.vasilhame_ultima_compra.id);
                } else {
                  setVasilhameSelecionado("");
                  setVasilhameManualId("");
                }
                setTimeout(() => {
                  document.getElementById("quantidade-input")?.focus();
                }, 100);
              }}
              placeholder="Código ou nome"
            />

            {produtoSelecionado && (
              <div className="space-y-3">
                <div className="bg-primary/10 border-2 border-primary/30 p-3 md:p-4 rounded-xl">
                  <div className="font-bold text-xl md:text-2xl mb-2">
                    {produtoSelecionado.codigo} - {produtoSelecionado.descricao}
                  </div>
                  
                  <div className="border-t-2 pt-2">
                    <label className="text-sm md:text-base text-muted-foreground font-semibold block mb-2">📦 Embalagem:</label>
                    
                    {(produtoSelecionado.vasilhame_padrao || produtoSelecionado.vasilhame_secundario || produtoSelecionado.vasilhame_ultima_compra) ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                        {produtoSelecionado.vasilhame_padrao && (
                          <button
                            type="button"
                            onClick={() => {
                              setVasilhameSelecionado("padrao");
                              setVasilhameManualId("");
                            }}
                            className={`p-4 md:p-5 rounded-xl border-2 transition-all min-h-[80px] md:min-h-[100px] ${
                              vasilhameSelecionado === "padrao"
                                ? "bg-blue-500 text-white border-blue-600 shadow-lg"
                                : "bg-card border-border hover:border-blue-400"
                            }`}
                          >
                            <div className="text-base md:text-lg font-semibold">
                              {produtoSelecionado.vasilhame_padrao.nome}
                            </div>
                            <div className="text-xl md:text-2xl font-bold mt-1">
                              {produtoSelecionado.vasilhame_padrao.peso_kg} kg/cx
                            </div>
                          </button>
                        )}
                        {produtoSelecionado.vasilhame_secundario && (
                          <button
                            type="button"
                            onClick={() => {
                              setVasilhameSelecionado("secundario");
                              setVasilhameManualId("");
                            }}
                            className={`p-4 md:p-5 rounded-xl border-2 transition-all min-h-[80px] md:min-h-[100px] ${
                              vasilhameSelecionado === "secundario"
                                ? "bg-blue-500 text-white border-blue-600 shadow-lg"
                                : "bg-background border-border hover:border-blue-400"
                            }`}
                          >
                            <div className="text-sm font-medium">
                              {produtoSelecionado.vasilhame_secundario.nome}
                            </div>
                            <div className="text-lg font-bold">
                              {produtoSelecionado.vasilhame_secundario.peso_kg} kg/cx
                            </div>
                          </button>
                        )}
                        {produtoSelecionado.vasilhame_ultima_compra && !produtoSelecionado.vasilhame_padrao && !produtoSelecionado.vasilhame_secundario && (
                          <button
                            type="button"
                            onClick={() => {
                              setVasilhameSelecionado("manual");
                              setVasilhameManualId(produtoSelecionado.vasilhame_ultima_compra.id);
                            }}
                            className={`flex-1 p-3 rounded border-2 transition-all min-h-[70px] ${
                              vasilhameSelecionado === "manual" && vasilhameManualId === produtoSelecionado.vasilhame_ultima_compra.id
                                ? "bg-blue-500 text-white border-blue-600"
                                : "bg-background border-border hover:border-blue-400"
                            }`}
                          >
                            <div className="text-sm font-medium">
                              {produtoSelecionado.vasilhame_ultima_compra.nome} ⏱️
                            </div>
                            <div className="text-lg font-bold">
                              {produtoSelecionado.vasilhame_ultima_compra.peso_kg} kg/cx
                            </div>
                            <div className="text-xs">
                              Última usada
                            </div>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                       <div className="text-sm text-amber-600 font-medium p-3 bg-amber-50 rounded-lg border-2 border-amber-200 mb-2">
                          ℹ️ Produto sem embalagem. Selecione abaixo:
                        </div>
                        <Select
                          value={vasilhameManualId}
                          onValueChange={(value) => {
                            setVasilhameManualId(value);
                            setVasilhameSelecionado("manual");
                          }}
                        >
                          <SelectTrigger className="h-16 text-lg border-2">
                            <SelectValue placeholder="Selecione a embalagem" />
                          </SelectTrigger>
                          <SelectContent>
                            {todosVasilhames.map((vasilhame: any) => (
                              <SelectItem key={vasilhame.id} value={vasilhame.id} className="text-lg py-4">
                                {vasilhame.nome} - {vasilhame.peso_kg} {vasilhame.unidade_base}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {vasilhameManualId && (
                          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                            ✓ Embalagem selecionada: {todosVasilhames.find((v: any) => v.id === vasilhameManualId)?.nome}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div id="quantidade-input">
                    <InputNumericoMobile
                      label="Qtd Caixas"
                      value={quantidade}
                      onChange={setQuantidade}
                      placeholder="0"
                    />
                  </div>

                  <InputNumericoMobile
                    label="R$ por Caixa"
                    value={valorPorCaixa}
                    onChange={setValorPorCaixa}
                    placeholder="0,00"
                    prefix="R$"
                  />
                </div>

                <Button
                  size="lg"
                  className="w-full h-20 md:h-24 text-xl md:text-2xl font-bold shadow-lg"
                  onClick={adicionarAoCarrinho}
                  disabled={!produtoSelecionado || !quantidade || 
                    (!produtoSelecionado.vasilhame_padrao && !produtoSelecionado.vasilhame_secundario && !produtoSelecionado.vasilhame_ultima_compra && !vasilhameManualId)}
                >
                  <Plus className="h-7 w-7 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Carrinho */}
      {carrinhoArray.length > 0 && (
        <Card className="border-2 border-green-500/50 shadow-lg">
          <CardHeader className="pb-3 pt-3 px-3 md:px-6">
            <CardTitle className="flex items-center justify-between text-xl md:text-2xl">
              <span className="flex items-center gap-3">
                <List className="h-6 w-6 md:h-7 md:w-7" />
                Carrinho ({carrinhoArray.length})
              </span>
              <div className="flex flex-col items-end">
                <span className="text-2xl md:text-3xl font-bold text-green-600">
                  R$ {totalCarrinho.toFixed(2)}
                </span>
                <span className="text-base md:text-lg text-muted-foreground font-semibold">
                  {carrinhoArray.reduce((sum, item) => sum + item.peso_total_kg, 0).toFixed(1)} kg total
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-2 md:px-4 pb-3">
            {carrinhoArray.map((item, index) => (
              <SwipeableCarrinhoItem
                key={index}
                item={item}
                index={index}
                onRemove={removerDoCarrinho}
              />
            ))}

            <Button
              size="lg"
              className="w-full h-20 md:h-24 text-xl md:text-2xl font-bold bg-green-600 hover:bg-green-700 mt-4 shadow-lg"
              onClick={() => salvarCompraMutation.mutate()}
              disabled={salvarCompraMutation.isPending}
            >
              <Save className="h-7 w-7 mr-2" />
              {salvarCompraMutation.isPending ? "Salvando..." : "💾 Finalizar Compra"}
            </Button>
          </CardContent>
        </Card>
      )}
          </div>
        </TabsContent>

        <TabsContent value="conferencia" className="mt-0 py-3 md:py-4">
          <ConferenciaMobile loteData={loteData} onLoteDataChange={setLoteData} />
        </TabsContent>

        <TabsContent value="precificacao" className="mt-0 py-3 md:py-4">
          <PrecificacaoMobile loteData={loteData} onLoteDataChange={setLoteData} />
        </TabsContent>
      </Tabs>
      </div>

      {/* Modal Novo Fornecedor */}
      <NovoFornecedorModal
        open={novoFornecedorModalOpen}
        onOpenChange={setNovoFornecedorModalOpen}
        onSuccess={(fornecedorId) => {
          setFornecedorSelecionado(fornecedorId);
          queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
        }}
      />

      {/* Modal Novo Produto */}
      <Dialog open={novoProdutoModalOpen} onOpenChange={setNovoProdutoModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Produto</DialogTitle>
          </DialogHeader>
          <ProdutoForm
            produtoId={null}
            onSuccess={() => {
              setNovoProdutoModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ["produtos-todos"] });
              toast.success("Produto cadastrado com sucesso!");
            }}
            onCancel={() => setNovoProdutoModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação */}
      <AlertDialog open={cancelarDialogOpen} onOpenChange={setCancelarDialogOpen}>
        <AlertDialogContent className="w-[90vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar Lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem {carrinhoArray.length} {carrinhoArray.length === 1 ? "item" : "itens"} no carrinho.
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
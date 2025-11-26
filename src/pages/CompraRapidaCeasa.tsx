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
  
  // Sincronização offline
  useOfflineSync();
  
  const [quantidade, setQuantidade] = useState("");
  const [valorTotal, setValorTotal] = useState("");
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
    if (fornecedorSelecionado || carrinho.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        fornecedor: fornecedorSelecionado,
        carrinho: carrinho
      }));
    }
  }, [fornecedorSelecionado, carrinho]);

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
          carrinho: carrinho,
          timestamp: Date.now()
        }));
        return { numero_compra: 'PENDENTE', pendente: true };
      }

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
      const itens = carrinho.map((item) => {
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
        setValorTotal("");
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
    setValorTotal(produto.ultimo_valor?.toString() || "");
    setVasilhameManualId("");
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

    const qtdCaixas = parseFloat(quantidade);
    const pesoUnitario = vasilhameUsado.peso_kg;
    const pesoTotal = qtdCaixas * pesoUnitario;

    const novoItem: ItemCarrinho = {
      produto_id: produtoSelecionado.id,
      codigo: produtoSelecionado.codigo,
      descricao: produtoSelecionado.descricao,
      unidade: produtoSelecionado.unidade_venda,
      quantidade: quantidade,
      valor_total: valorTotal || "0",
      vasilhame_id: vasilhameUsado.id,
      vasilhame_nome: vasilhameUsado.nome,
      peso_unitario_kg: pesoUnitario,
      peso_total_kg: pesoTotal,
    };

    setCarrinho([...carrinho, novoItem]);
    setProdutoSelecionado(null);
    setQuantidade("");
    setValorTotal("");
    setVasilhameManualId("");
    toast.success(`${produtoSelecionado.descricao} adicionado! (${pesoTotal}kg)`);
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

  const totalCarrinho = carrinho.reduce((sum, item) => 
    sum + parseFloat(item.valor_total || "0"), 0
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header Compacto */}
      <div className="bg-black text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 40 40" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="20" cy="22" r="12" stroke="white" strokeWidth="2" fill="none" />
                <path d="M20 10 Q23 7 26 10 L25 12 Q22 10 20 12 Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
              </svg>
              <h1 className="text-3xl font-light tracking-[0.3em]">
                HORTII
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/produtos-gestao")}
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-4 w-4 mr-1" />
              Gestão
            </Button>
          </div>
          {activeTab === "lancamento" && fornecedorSelecionado && (
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelarCompra}
              className="text-white hover:bg-white/20 h-8 absolute right-3"
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 sticky top-[60px] z-20 rounded-none border-b bg-background shadow-sm">
          <TabsTrigger value="lancamento" className="text-xs gap-1">
            <List className="h-4 w-4" />
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
        </TabsList>

        <TabsContent value="lancamento" className="mt-0">
          <div className="space-y-2 p-2">

      {/* Seleção de Fornecedor */}
      <Card className="border">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4" />
            Fornecedor
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Filtrar por tipo:</Label>
            <div className="grid grid-cols-4 gap-1">
              {["TODOS", "PEDRA", "LOJAS", "OUTROS"].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => {
                    setTipoFornecedorFiltro(tipo);
                    localStorage.setItem("tipo_fornecedor_filtro", tipo);
                  }}
                  className={`p-2 text-xs font-medium rounded border-2 transition-all ${
                    tipoFornecedorFiltro === tipo
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  }`}
                >
                  {tipo === "PEDRA" && "🪨"}
                  {tipo === "LOJAS" && "🏪"}
                  {tipo === "OUTROS" && "📦"}
                  {tipo === "TODOS" && "🔍"}
                  <div className="text-[10px] mt-0.5">{tipo}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <Select 
              value={fornecedorSelecionado} 
              onValueChange={(value) => {
                setFornecedorSelecionado(value);
                localStorage.setItem("ultimo_fornecedor", value);
              }}
            >
              <SelectTrigger className="h-12 text-base border-2">
                <SelectValue placeholder="Selecione o fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {fornecedores?.map((f: any) => (
                  <SelectItem key={f.id} value={f.id} className="text-base py-2">
                    <div className="flex items-center gap-2">
                      {f.tipo === "PEDRA" && "🪨"}
                      {f.tipo === "LOJAS" && "🏪"}
                      {f.tipo === "OUTROS" && "📦"}
                      <span className="font-medium">{f.nome_fantasia || f.razao_social}</span>
                      {f.box && <span className="text-xs text-muted-foreground">({f.box})</span>}
                    </div>
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Buscar Produto</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNovoProdutoModalOpen(true)}
                className="h-7 text-xs gap-1"
              >
                <Plus className="h-3 w-3" />
                Novo Produto
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3">
            <BuscaProdutoInteligente
              onSelectProduto={(produto) => {
                setProdutoSelecionado(produto);
                setVasilhameSelecionado(produto.vasilhame_padrao ? "padrao" : "secundario");
                setVasilhameManualId("");
                setTimeout(() => {
                  document.getElementById("quantidade-input")?.focus();
                }, 100);
              }}
              placeholder="Código ou nome"
            />

            {produtoSelecionado && (
              <div className="space-y-2">
                <div className="bg-primary/10 border border-primary/30 p-3 rounded-lg">
                  <div className="font-semibold text-base mb-2">
                    {produtoSelecionado.codigo} - {produtoSelecionado.descricao}
                  </div>
                  
                  <div className="border-t pt-2">
                    <label className="text-[10px] text-muted-foreground font-medium block mb-1">📦 Embalagem:</label>
                    
                    {(produtoSelecionado.vasilhame_padrao || produtoSelecionado.vasilhame_secundario) ? (
                      <div className="flex gap-2">
                        {produtoSelecionado.vasilhame_padrao && (
                          <button
                            type="button"
                            onClick={() => {
                              setVasilhameSelecionado("padrao");
                              setVasilhameManualId("");
                            }}
                            className={`flex-1 p-2 rounded border-2 transition-all ${
                              vasilhameSelecionado === "padrao"
                                ? "bg-blue-500 text-white border-blue-600"
                                : "bg-background border-border hover:border-blue-400"
                            }`}
                          >
                            <div className="text-[11px] font-medium">
                              {produtoSelecionado.vasilhame_padrao.nome}
                            </div>
                            <div className="text-sm font-bold">
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
                            className={`flex-1 p-2 rounded border-2 transition-all ${
                              vasilhameSelecionado === "secundario"
                                ? "bg-blue-500 text-white border-blue-600"
                                : "bg-background border-border hover:border-blue-400"
                            }`}
                          >
                            <div className="text-[11px] font-medium">
                              {produtoSelecionado.vasilhame_secundario.nome}
                            </div>
                            <div className="text-sm font-bold">
                              {produtoSelecionado.vasilhame_secundario.peso_kg} kg/cx
                            </div>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs text-amber-600 font-medium p-2 bg-amber-50 rounded border border-amber-200 mb-2">
                          ℹ️ Produto sem embalagem. Selecione abaixo:
                        </div>
                        <Select
                          value={vasilhameManualId}
                          onValueChange={(value) => {
                            setVasilhameManualId(value);
                            setVasilhameSelecionado("manual");
                          }}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Selecione a embalagem" />
                          </SelectTrigger>
                          <SelectContent>
                            {todosVasilhames.map((vasilhame: any) => (
                              <SelectItem key={vasilhame.id} value={vasilhame.id}>
                                {vasilhame.nome} - {vasilhame.peso_kg} kg
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {vasilhameManualId && (
                          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            ✓ Embalagem selecionada: {todosVasilhames.find((v: any) => v.id === vasilhameManualId)?.nome}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div id="quantidade-input">
                    <InputNumericoMobile
                      label="Qtd Caixas"
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
                  disabled={!produtoSelecionado || !quantidade || 
                    (!produtoSelecionado.vasilhame_padrao && !produtoSelecionado.vasilhame_secundario && !vasilhameManualId)}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Adicionar
                </Button>
              </div>
            )}
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
              <span className="text-sm text-muted-foreground ml-2">
                ({carrinho.reduce((sum, item) => sum + item.peso_total_kg, 0).toFixed(1)} kg)
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
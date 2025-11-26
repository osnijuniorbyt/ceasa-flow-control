import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NovoFornecedorModal } from "./NovoFornecedorModal";

interface Fornecedor {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  contato: string | null;
}

interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  unidade_venda: string;
}

interface ItemCompra {
  produto_id: string;
  produto_descricao: string;
  quantidade: number;
  valor_pago: number;
  subtotal: number;
}

export function RegistroCompra() {
  const navigate = useNavigate();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Fornecedor | null>(null);
  const [buscaFornecedor, setBuscaFornecedor] = useState("");
  const [showNovoFornecedor, setShowNovoFornecedor] = useState(false);
  
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState("");
  const [valorPago, setValorPago] = useState("");
  
  const [itensCompra, setItensCompra] = useState<ItemCompra[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  // Carregar fornecedores
  useEffect(() => {
    loadFornecedores();
  }, []);

  // Carregar produtos quando buscar
  useEffect(() => {
    if (buscaProduto.length >= 2) {
      loadProdutos(buscaProduto);
    } else {
      setProdutos([]);
    }
  }, [buscaProduto]);

  const loadFornecedores = async () => {
    const { data, error } = await supabase
      .from("fornecedores")
      .select("id, razao_social, nome_fantasia, contato")
      .eq("ativo", true)
      .order("razao_social");

    if (error) {
      console.error("Erro ao carregar fornecedores:", error);
      return;
    }

    setFornecedores(data || []);
  };

  const loadProdutos = async (busca: string) => {
    const { data, error } = await supabase
      .from("produtos")
      .select("id, codigo, descricao, unidade_venda")
      .eq("ativo", true)
      .or(`codigo.ilike.%${busca}%,descricao.ilike.%${busca}%`)
      .limit(10);

    if (error) {
      console.error("Erro ao carregar produtos:", error);
      return;
    }

    setProdutos(data || []);
  };

  const fornecedoresFiltrados = fornecedores.filter(f =>
    f.razao_social.toLowerCase().includes(buscaFornecedor.toLowerCase()) ||
    (f.nome_fantasia && f.nome_fantasia.toLowerCase().includes(buscaFornecedor.toLowerCase()))
  );

  const handleAdicionarItem = () => {
    if (!produtoSelecionado) {
      toast({ title: "Selecione um produto", variant: "destructive" });
      return;
    }
    if (!quantidade || parseFloat(quantidade) <= 0) {
      toast({ title: "Informe a quantidade", variant: "destructive" });
      return;
    }
    if (!valorPago || parseFloat(valorPago) <= 0) {
      toast({ title: "Informe o valor pago", variant: "destructive" });
      return;
    }

    const qtd = parseFloat(quantidade);
    const valor = parseFloat(valorPago);
    
    setItensCompra([...itensCompra, {
      produto_id: produtoSelecionado.id,
      produto_descricao: produtoSelecionado.descricao,
      quantidade: qtd,
      valor_pago: valor,
      subtotal: qtd * valor,
    }]);

    setProdutoSelecionado(null);
    setBuscaProduto("");
    setQuantidade("");
    setValorPago("");
  };

  const handleRemoverItem = (index: number) => {
    setItensCompra(itensCompra.filter((_, i) => i !== index));
  };

  const totalCompra = itensCompra.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSalvarCompra = async () => {
    if (!fornecedorSelecionado) {
      toast({ title: "Selecione um fornecedor", variant: "destructive" });
      return;
    }
    if (itensCompra.length === 0) {
      toast({ title: "Adicione pelo menos um item", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      // Criar compra
      const { data: compra, error: compraError } = await supabase
        .from("compras")
        .insert({
          fornecedor_id: fornecedorSelecionado.id,
          status: "confirmado",
          valor_produtos: totalCompra,
          valor_total: totalCompra,
          numero_compra: 0,
          user_id: user.id
        })
        .select()
        .single();

      if (compraError) throw compraError;

      // Buscar vasilhame padrão
      const { data: vasilhames } = await supabase
        .from("vasilhames")
        .select("id")
        .eq("ativo", true)
        .limit(1);

      const vasilhameId = vasilhames?.[0]?.id;

      // Criar itens da compra
      const itensParaInserir = itensCompra.map(item => ({
        compra_id: compra.id,
        produto_id: item.produto_id,
        vasilhame_id: vasilhameId,
        quantidade_vasilhames: item.quantidade,
        peso_total_kg: item.quantidade,
        preco_por_vasilhame: item.valor_pago,
        preco_por_kg: item.valor_pago,
        subtotal: item.subtotal,
      }));

      const { error: itensError } = await supabase
        .from("itens_compra")
        .insert(itensParaInserir);

      if (itensError) throw itensError;

      toast({
        title: "Sucesso",
        description: `Compra #${compra.numero_compra} salva com sucesso!`,
      });

      // Limpar formulário
      setItensCompra([]);
      setFornecedorSelecionado(null);
      setBuscaFornecedor("");
      
      // Navegar para a tela da compra criada
      navigate(`/compra-rapida/${compra.id}`);
    } catch (error) {
      console.error("Erro ao salvar compra:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar compra",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Seleção de Fornecedor */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Fornecedor</Label>
            <Button
              size="sm"
              onClick={() => setShowNovoFornecedor(true)}
              className="h-10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo
            </Button>
          </div>

          {!fornecedorSelecionado ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar fornecedor..."
                  value={buscaFornecedor}
                  onChange={(e) => setBuscaFornecedor(e.target.value)}
                  className="h-14 pl-11 text-lg"
                />
              </div>

              {buscaFornecedor && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {fornecedoresFiltrados.map((fornecedor) => (
                    <button
                      key={fornecedor.id}
                      onClick={() => {
                        setFornecedorSelecionado(fornecedor);
                        setBuscaFornecedor("");
                      }}
                      className="w-full p-4 text-left bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                    >
                      <div className="font-medium">{fornecedor.razao_social}</div>
                      {fornecedor.contato && (
                        <div className="text-sm text-muted-foreground">{fornecedor.contato}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{fornecedorSelecionado.razao_social}</div>
                  {fornecedorSelecionado.contato && (
                    <div className="text-sm text-muted-foreground">{fornecedorSelecionado.contato}</div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFornecedorSelecionado(null)}
                >
                  Trocar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adicionar Produtos */}
      {fornecedorSelecionado && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Label className="text-lg font-semibold">Adicionar Produto</Label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar produto por código ou nome..."
                value={buscaProduto}
                onChange={(e) => setBuscaProduto(e.target.value)}
                className="h-14 pl-11 text-lg"
              />
            </div>

            {produtos.length > 0 && !produtoSelecionado && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {produtos.map((produto) => (
                  <button
                    key={produto.id}
                    onClick={() => {
                      setProdutoSelecionado(produto);
                      setProdutos([]);
                    }}
                    className="w-full p-4 text-left bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                  >
                    <div className="font-medium">{produto.descricao}</div>
                    <div className="text-sm text-muted-foreground">
                      Código: {produto.codigo} | Unidade: {produto.unidade_venda}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {produtoSelecionado && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <div className="font-medium text-lg">{produtoSelecionado.descricao}</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                      placeholder="0"
                      className="h-14 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Pago (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={valorPago}
                      onChange={(e) => setValorPago(e.target.value)}
                      placeholder="0,00"
                      className="h-14 text-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setProdutoSelecionado(null);
                      setBuscaProduto("");
                      setQuantidade("");
                      setValorPago("");
                    }}
                    className="flex-1 h-12"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAdicionarItem}
                    className="flex-1 h-12"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Itens da Compra */}
      {itensCompra.length > 0 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Label className="text-lg font-semibold">Itens da Compra</Label>

            <div className="space-y-3">
              {itensCompra.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.produto_descricao}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantidade} x R$ {item.valor_pago.toFixed(2)} = R$ {item.subtotal.toFixed(2)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoverItem(index)}
                    className="h-10 w-10 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">R$ {totalCompra.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleSalvarCompra}
              disabled={loading}
              className="w-full h-16 text-xl"
              size="lg"
            >
              <ShoppingCart className="h-6 w-6 mr-3" />
              {loading ? "Salvando..." : "SALVAR COMPRA"}
            </Button>
          </CardContent>
        </Card>
      )}

      <NovoFornecedorModal
        open={showNovoFornecedor}
        onOpenChange={setShowNovoFornecedor}
        onSuccess={async (id) => {
          await loadFornecedores();
          const fornecedor = fornecedores.find(f => f.id === id);
          if (fornecedor) {
            setFornecedorSelecionado(fornecedor);
          }
        }}
      />
    </div>
  );
}

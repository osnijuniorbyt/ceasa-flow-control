import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BuscaProdutoInteligente } from "@/components/compras-ceasa/BuscaProdutoInteligente";
import { InputNumericoMobile } from "@/components/compras-ceasa/InputNumericoMobile";
import { ShoppingCart, Truck, List, Plus, Trash2, Save } from "lucide-react";
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

export default function CompraRapidaCeasa() {
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<string>("");
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [quantidade, setQuantidade] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

      // Criar compra
      const valorTotalCompra = carrinho.reduce((sum, item) => 
        sum + parseFloat(item.valor_total || "0"), 0
      );

      const { data: compra, error: compraError } = await supabase
        .from("compras")
        .insert([{
          fornecedor_id: fornecedorSelecionado,
          valor_produtos: valorTotalCompra,
          valor_total: valorTotalCompra,
          status: "confirmado",
          numero_compra: 0, // Será gerado automaticamente pelo trigger
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
      setCarrinho([]);
      setQuantidade("");
      setValorTotal("");
      queryClient.invalidateQueries({ queryKey: ["compras"] });
      navigate(`/compra-rapida/${compra.id}`);
    },
    onError: (error: any) => {
      console.error("Erro detalhado:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

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
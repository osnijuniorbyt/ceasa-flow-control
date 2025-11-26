import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Trash2, ShoppingCart, AlertCircle, Building2, Package } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface CartItem {
  produto_id: string;
  produto_codigo: string;
  produto_descricao: string;
  vasilhame_id: string;
  vasilhame_nome: string;
  vasilhame_peso: number;
  quantidade: number;
  preco_por_vasilhame: number;
  peso_total_kg: number;
  preco_por_kg: number;
  margem: number;
  preco_venda_sugerido: number;
  subtotal: number;
}

export default function CompraRapida() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [fornecedorId, setFornecedorId] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVasilhame, setSelectedVasilhame] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [precoVasilhame, setPrecoVasilhame] = useState(0);

  const { data: produtos, isLoading: loadingProdutos } = useQuery({
    queryKey: ["produtos", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("produtos")
        .select("id, codigo, descricao, unidade_venda, margem_padrao")
        .eq("ativo", true)
        .limit(50);

      if (searchTerm) {
        query = query.or(`codigo.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`);
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
      return data;
    },
  });

  const { data: fornecedores } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("*")
        .eq("ativo", true);
      if (error) throw error;
      return data;
    },
  });

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedVasilhame || quantidade <= 0 || precoVasilhame <= 0) {
      toast.error("Preencha todos os campos");
      return;
    }

    const vasilhame = vasilhames?.find(v => v.id === selectedVasilhame);
    if (!vasilhame) return;

    // Usa o tipo_calculo do vasilhame para determinar se calcula por peso ou unidade
    const isPorPeso = vasilhame.tipo_calculo === 'peso';
    
    let peso_total_kg: number;
    let preco_por_kg: number;
    let preco_venda_sugerido: number;
    const margem = selectedProduct.margem_padrao || 0;
    
    if (isPorPeso) {
      // Produto por peso: calcular normalmente em kg
      peso_total_kg = quantidade * vasilhame.peso_kg;
      preco_por_kg = precoVasilhame / vasilhame.peso_kg;
      preco_venda_sugerido = preco_por_kg * (1 + margem / 100);
    } else {
      // Produto por unidade: quantidade é o total de unidades
      peso_total_kg = quantidade * vasilhame.peso_kg; // quantidade total de unidades
      preco_por_kg = precoVasilhame / vasilhame.peso_kg; // preço por unidade
      preco_venda_sugerido = preco_por_kg * (1 + margem / 100);
    }
    
    const subtotal = quantidade * precoVasilhame;

    const item: CartItem = {
      produto_id: selectedProduct.id,
      produto_codigo: selectedProduct.codigo,
      produto_descricao: selectedProduct.descricao,
      vasilhame_id: vasilhame.id,
      vasilhame_nome: vasilhame.nome,
      vasilhame_peso: vasilhame.peso_kg,
      quantidade,
      preco_por_vasilhame: precoVasilhame,
      peso_total_kg,
      preco_por_kg,
      margem,
      preco_venda_sugerido,
      subtotal,
    };

    setCart([...cart, item]);
    setSelectedProduct(null);
    setSelectedVasilhame("");
    setQuantidade(1);
    setPrecoVasilhame(0);
    toast.success("✅ Item adicionado ao carrinho!");
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
    toast.success("Item removido");
  };

  const handleFinalizarCompra = async () => {
    if (cart.length === 0) {
      toast.error("Carrinho vazio");
      return;
    }

    if (!fornecedorId || !formaPagamento) {
      toast.error("Selecione fornecedor e forma de pagamento");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data: compra, error: compraError } = await supabase
        .from("compras")
        .insert([{
          fornecedor_id: fornecedorId,
          forma_pagamento: formaPagamento,
          status: "finalizada",
          valor_produtos: cart.reduce((sum, item) => sum + item.subtotal, 0),
          valor_total: cart.reduce((sum, item) => sum + item.subtotal, 0),
          numero_compra: 0,
          user_id: user.id
        }])
        .select()
        .single();

      if (compraError) throw compraError;

      const items = cart.map(item => ({
        compra_id: compra.id,
        produto_id: item.produto_id,
        vasilhame_id: item.vasilhame_id,
        quantidade_vasilhames: item.quantidade,
        peso_total_kg: item.peso_total_kg,
        preco_por_vasilhame: item.preco_por_vasilhame,
        preco_por_kg: item.preco_por_kg,
        subtotal: item.subtotal,
        margem_aplicada: item.margem,
        preco_venda_sugerido: item.preco_venda_sugerido,
      }));

      const { error: itensError } = await supabase.from("itens_compra").insert(items);
      if (itensError) throw itensError;

      for (const item of cart) {
        await supabase
          .from("produtos")
          .update({
            preco_ultima_compra: item.preco_por_kg,
            data_ultima_compra: new Date().toISOString(),
            vasilhame_ultima_compra_id: item.vasilhame_id,
          })
          .eq("id", item.produto_id);
      }

      toast.success(`✅ Compra #${compra.numero_compra} registrada com sucesso!`);
      setCart([]);
      setFornecedorId("");
      setFormaPagamento("");
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  const totalCompra = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // Check if data is missing
  const semProdutos = !loadingProdutos && (!produtos || produtos.length === 0);
  const semFornecedores = !fornecedores || fornecedores.length === 0;

  if (semProdutos || semFornecedores) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">Sistema precisa de configuração inicial:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {semFornecedores && (
                  <li>
                    Cadastre fornecedores em{" "}
                    <Link to="/fornecedores" className="text-primary underline">
                      Fornecedores
                    </Link>
                  </li>
                )}
                {semProdutos && (
                  <>
                    <li>
                      Crie grupos/subgrupos em{" "}
                      <Link to="/categories" className="text-primary underline">
                        Árvore Mercadológica
                      </Link>
                    </li>
                    <li>
                      Importe produtos em{" "}
                      <Link to="/product-import" className="text-primary underline">
                        Importar Produtos
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {semFornecedores && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Fornecedores
                </CardTitle>
                <CardDescription>Cadastre seus fornecedores</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/fornecedores">
                  <Button className="w-full">Cadastrar Fornecedores</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {semProdutos && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos
                </CardTitle>
                <CardDescription>Configure grupos e importe produtos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/categories">
                  <Button variant="outline" className="w-full">
                    1. Árvore Mercadológica
                  </Button>
                </Link>
                <Link to="/product-import">
                  <Button variant="outline" className="w-full">
                    2. Importar Produtos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Buscar Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {produtos?.map((produto) => (
                <div
                  key={produto.id}
                  onClick={() => setSelectedProduct(produto)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedProduct?.id === produto.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-sm text-muted-foreground">{produto.codigo}</div>
                      <div className="font-medium">{produto.descricao}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{produto.unidade_venda}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle>Adicionar ao Carrinho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vasilhame</Label>
                  <Select value={selectedVasilhame} onValueChange={setSelectedVasilhame}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                       {vasilhames?.map((v) => (
                         <SelectItem key={v.id} value={v.id}>
                           {v.nome} ({v.peso_kg} {v.unidade_base})
                         </SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label>Preço por Vasilhame (R$)</Label>
                <Input
                  type="number"
                  value={precoVasilhame}
                  onChange={(e) => setPrecoVasilhame(Number(e.target.value))}
                  step="0.01"
                  min="0"
                />
              </div>

              {selectedVasilhame && quantidade > 0 && precoVasilhame > 0 && (() => {
                const vasilhame = vasilhames?.find(v => v.id === selectedVasilhame);
                if (!vasilhame) return null;
                
                const isPorPeso = vasilhame.tipo_calculo === 'peso';
                const totalQuantidade = quantidade * vasilhame.peso_kg;
                const precoUnitario = precoVasilhame / vasilhame.peso_kg;
                const precoVenda = precoUnitario * (1 + (selectedProduct.margem_padrao || 0) / 100);
                
                return (
                  <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total {isPorPeso ? 'Peso' : 'Quantidade'}:</span>
                      <span className="font-medium">
                        {totalQuantidade.toFixed(2)} {vasilhame.unidade_base}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preço/{vasilhame.unidade_base}:</span>
                      <span className="font-medium">
                        R$ {precoUnitario.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preço Venda/{vasilhame.unidade_base}:</span>
                      <span className="font-medium text-green-600">
                        R$ {precoVenda.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Subtotal:</span>
                      <span>R$ {(quantidade * precoVasilhame).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}

              <Button onClick={handleAddToCart} className="w-full">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="h-fit sticky top-6">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Carrinho ({cart.length} {cart.length === 1 ? "item" : "itens"})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Carrinho vazio</p>
              <p className="text-sm mt-1">Selecione produtos para adicionar</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-muted/30">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-mono text-xs text-muted-foreground">{item.produto_codigo}</div>
                        <div className="font-medium text-sm">{item.produto_descricao}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFromCart(index)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div>{item.quantidade}x {item.vasilhame_nome}</div>
                      <div>Total: {item.peso_total_kg.toFixed(2)} {vasilhames?.find(v => v.id === item.vasilhame_id)?.unidade_base || 'un'}</div>
                      <div>R$ {item.preco_por_kg.toFixed(2)}/{vasilhames?.find(v => v.id === item.vasilhame_id)?.unidade_base || 'un'}</div>
                      <div className="font-bold text-foreground text-sm mt-1">R$ {item.subtotal.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label>Fornecedor *</Label>
                  <Select value={fornecedorId} onValueChange={setFornecedorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {fornecedores?.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.nome_fantasia || f.razao_social}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Forma de Pagamento *</Label>
                  <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                      <SelectItem value="Nota Fiscal">Nota Fiscal</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary">R$ {totalCompra.toFixed(2)}</span>
                </div>

                <Button 
                  onClick={handleFinalizarCompra} 
                  className="w-full" 
                  size="lg"
                  disabled={!fornecedorId || !formaPagamento}
                >
                  Finalizar Compra
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

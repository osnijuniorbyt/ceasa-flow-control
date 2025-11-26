import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TouchCard } from "../TouchCard";
import { TouchButton } from "../TouchButton";
import { LoadingSkeleton } from "../LoadingSkeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "../NumberInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Search, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  produto_id: string;
  produto_codigo: string;
  produto_descricao: string;
  fornecedor_id: string;
  fornecedor_nome: string;
  quantidade: number;
  valor_pago: number;
  subtotal: number;
}

export function CompradorInterface() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [fornecedorId, setFornecedorId] = useState("");
  const [quantidade, setQuantidade] = useState(0);
  const [valorPago, setValorPago] = useState(0);

  const { data: produtos, isLoading: loadingProducts } = useQuery({
    queryKey: ["produtos-mobile", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("produtos")
        .select("id, codigo, descricao, unidade_venda")
        .eq("ativo", true)
        .limit(20);

      if (searchTerm) {
        query = query.or(`codigo.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
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
    if (!selectedProduct || !fornecedorId || quantidade <= 0 || valorPago <= 0) {
      toast.error("Preencha todos os campos");
      return;
    }

    const fornecedor = fornecedores?.find(f => f.id === fornecedorId);
    if (!fornecedor) return;

    const item: CartItem = {
      produto_id: selectedProduct.id,
      produto_codigo: selectedProduct.codigo,
      produto_descricao: selectedProduct.descricao,
      fornecedor_id: fornecedor.id,
      fornecedor_nome: fornecedor.nome_fantasia || fornecedor.razao_social,
      quantidade,
      valor_pago: valorPago,
      subtotal: quantidade * valorPago,
    };

    setCart([...cart, item]);
    setSelectedProduct(null);
    setFornecedorId("");
    setQuantidade(0);
    setValorPago(0);
    setSearchTerm("");
    toast.success("Item adicionado!");
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

    try {
      // Group by supplier
      const groupedBySupplier = cart.reduce((acc, item) => {
        if (!acc[item.fornecedor_id]) {
          acc[item.fornecedor_id] = [];
        }
        acc[item.fornecedor_id].push(item);
        return acc;
      }, {} as Record<string, CartItem[]>);

      // Create one purchase per supplier
      for (const [fornecedorId, items] of Object.entries(groupedBySupplier)) {
        const totalValue = items.reduce((sum, item) => sum + item.subtotal, 0);

        const { data: compra, error: compraError } = await supabase
          .from("compras")
          .insert([{
            fornecedor_id: fornecedorId,
            forma_pagamento: "Dinheiro",
            status: "finalizada",
            valor_produtos: totalValue,
            valor_total: totalValue,
            numero_compra: 0,
          }])
          .select()
          .single();

        if (compraError) throw compraError;

        // Insert items (simplified - without vasilhame)
        const itemsToInsert = items.map(item => ({
          compra_id: compra.id,
          produto_id: item.produto_id,
          vasilhame_id: "00000000-0000-0000-0000-000000000000", // Placeholder
          quantidade_vasilhames: item.quantidade,
          peso_total_kg: item.quantidade,
          preco_por_vasilhame: item.valor_pago,
          preco_por_kg: item.valor_pago,
          subtotal: item.subtotal,
        }));

        const { error: itensError } = await supabase
          .from("itens_compra")
          .insert(itemsToInsert);

        if (itensError) throw itensError;
      }

      toast.success(`${Object.keys(groupedBySupplier).length} compra(s) registrada(s)!`);
      setCart([]);
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  if (loadingProducts) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  const totalCompra = cart.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="space-y-6 p-4 pb-32">
      <div className="sticky top-0 bg-background z-10 pb-4">
        <h2 className="text-2xl font-bold mb-4">Compra Rápida</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-14 text-lg"
          />
        </div>
      </div>

      {/* Products List */}
      {searchTerm && (
        <div className="space-y-2">
          {produtos?.map((produto) => (
            <TouchCard 
              key={produto.id}
              size="md"
              variant={selectedProduct?.id === produto.id ? "filled" : "outline"}
              onClick={() => setSelectedProduct(produto)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-mono text-sm text-muted-foreground">{produto.codigo}</div>
                  <div className="font-semibold">{produto.descricao}</div>
                </div>
                {selectedProduct?.id === produto.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </TouchCard>
          ))}
        </div>
      )}

      {/* Add Form */}
      {selectedProduct && (
        <TouchCard size="lg" variant="filled">
          <div className="space-y-4">
            <div className="pb-3 border-b">
              <div className="font-mono text-sm text-muted-foreground">{selectedProduct.codigo}</div>
              <div className="font-bold text-lg">{selectedProduct.descricao}</div>
            </div>

            <div>
              <Label className="text-base mb-2 block">Fornecedor</Label>
              <Select value={fornecedorId} onValueChange={setFornecedorId}>
                <SelectTrigger className="h-14 text-lg">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores?.map((f) => (
                    <SelectItem key={f.id} value={f.id} className="text-lg py-3">
                      {f.nome_fantasia || f.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-base mb-2 block">Quantidade</Label>
                <NumberInput
                  value={quantidade}
                  onChange={setQuantidade}
                  className="h-14 text-xl"
                  min={0}
                  max={999}
                  allowDecimal={false}
                  label="Digite a quantidade"
                />
              </div>

              <div>
                <Label className="text-base mb-2 block">Valor Pago (R$)</Label>
                <NumberInput
                  value={valorPago}
                  onChange={setValorPago}
                  className="h-14 text-xl"
                  min={0}
                  max={99999}
                  allowDecimal={true}
                  label="Digite o valor pago"
                  unit="R$"
                />
              </div>
            </div>

            {quantidade > 0 && valorPago > 0 && (
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg">Subtotal:</span>
                  <span className="text-2xl font-bold">
                    R$ {(quantidade * valorPago).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <TouchButton
              onClick={handleAddToCart}
              size="xl"
              fullWidth
              disabled={!fornecedorId || quantidade <= 0 || valorPago <= 0}
            >
              <Plus className="h-5 w-5 mr-2" />
              Adicionar ao Carrinho
            </TouchButton>
          </div>
        </TouchCard>
      )}

      {/* Cart */}
      {cart.length > 0 && (
        <TouchCard size="lg" variant="outline">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinho ({cart.length})
              </h3>
            </div>

            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={index} className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-mono text-xs text-muted-foreground">{item.produto_codigo}</div>
                      <div className="font-semibold">{item.produto_descricao}</div>
                      <div className="text-sm text-muted-foreground">{item.fornecedor_nome}</div>
                    </div>
                    <TouchButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFromCart(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </TouchButton>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{item.quantidade}x R$ {item.valor_pago.toFixed(2)}</span>
                    <span className="font-bold">R$ {item.subtotal.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t">
              <div className="flex justify-between items-center text-xl font-bold mb-4">
                <span>Total:</span>
                <span>R$ {totalCompra.toFixed(2)}</span>
              </div>

              <TouchButton
                onClick={handleFinalizarCompra}
                size="xl"
                fullWidth
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-6 w-6 mr-2" />
                Finalizar Compra
              </TouchButton>
            </div>
          </div>
        </TouchCard>
      )}
    </div>
  );
}

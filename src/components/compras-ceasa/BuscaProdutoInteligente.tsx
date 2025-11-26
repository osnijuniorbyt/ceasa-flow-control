import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Package } from "lucide-react";

interface BuscaProdutoInteligenteProps {
  onSelectProduto: (produto: any) => void;
  placeholder?: string;
}

export function BuscaProdutoInteligente({ onSelectProduto, placeholder = "Digite código ou nome do produto" }: BuscaProdutoInteligenteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: produtos } = useQuery({
    queryKey: ["produtos-busca", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 1) return [];

      const isNumeric = /^\d+$/.test(searchTerm);

      let query = supabase
        .from("produtos")
        .select(`
          id,
          codigo,
          descricao,
          unidade_venda,
          preco_ultima_compra,
          fornecedor_padrao_id,
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
          ),
          fornecedores:fornecedor_padrao_id (
            id,
            nome_fantasia,
            razao_social
          )
        `)
        .eq("ativo", true);

      if (isNumeric) {
        // Busca exata por código
        query = query.eq("codigo", searchTerm);
      } else {
        // Busca por nome (case insensitive)
        query = query.ilike("descricao", `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length > 0,
  });

  // Se digitar código e apertar Enter, seleciona automaticamente
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && produtos && produtos.length === 1) {
      handleSelectProduto(produtos[0]);
    }
  };

  const handleSelectProduto = (produto: any) => {
    onSelectProduto(produto);
    setSearchTerm("");
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  useEffect(() => {
    if (searchTerm && produtos && produtos.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm, produtos]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm && setShowSuggestions(true)}
          placeholder={placeholder}
          className="h-16 pl-14 pr-4 text-xl font-medium border-2"
          autoComplete="off"
        />
      </div>

      {showSuggestions && produtos && produtos.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 max-h-80 overflow-y-auto shadow-lg">
          <div className="divide-y">
            {produtos.map((produto) => (
              <button
                key={produto.id}
                onClick={() => handleSelectProduto(produto)}
                className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-start gap-3"
              >
                <Package className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg">
                    {produto.codigo} - {produto.descricao}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <span>Un: {produto.unidade_venda}</span>
                    {produto.preco_ultima_compra && (
                      <>
                        <span>•</span>
                        <span>Último: R$ {Number(produto.preco_ultima_compra).toFixed(2)}</span>
                      </>
                    )}
                  </div>
                  {produto.fornecedores && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Fornecedor: {produto.fornecedores.nome_fantasia || produto.fornecedores.razao_social}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
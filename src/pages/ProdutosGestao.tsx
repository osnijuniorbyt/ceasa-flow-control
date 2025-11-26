import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, Edit, ArrowLeft, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProdutoForm } from "@/components/produtos/ProdutoForm";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VasilhamesList } from "@/components/vasilhames/VasilhamesList";

export default function ProdutosGestao() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [produtoEditando, setProdutoEditando] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos-gestao", busca],
    queryFn: async () => {
      let query = supabase
        .from("produtos")
        .select(`
          *,
          grupos (nome),
          subgrupos (nome),
          vasilhames!produtos_vasilhame_padrao_id_fkey (nome, peso_kg, unidade_base, tipo_calculo),
          vasilhame_secundario:vasilhames!produtos_vasilhame_secundario_id_fkey (nome, peso_kg, unidade_base, tipo_calculo),
          fornecedores (razao_social, nome_fantasia)
        `)
        .order("descricao");

      if (busca) {
        query = query.or(`descricao.ilike.%${busca}%,codigo.ilike.%${busca}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-black text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <Package className="h-6 w-6" />
          <h1 className="text-xl font-light tracking-wide">GESTÃO DE PRODUTOS</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Tabs defaultValue="produtos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="produtos">
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="vasilhames">
              <Box className="h-4 w-4 mr-2" />
              Embalagens
            </TabsTrigger>
          </TabsList>

          <TabsContent value="produtos" className="space-y-4 mt-4">
            {/* Busca */}
            <Card className="sticky top-[60px] z-10 shadow-md">
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto por nome ou código..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {produtos.length} produtos encontrados
            </div>
          </CardContent>
        </Card>

        {/* Lista de Produtos */}
        <div className="space-y-2">
              {produtos.map((produto: any) => (
                <Card key={produto.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-muted-foreground">
                            {produto.codigo}
                          </span>
                          {!produto.ativo && (
                            <Badge variant="outline" className="text-xs">Inativo</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm mb-2">{produto.descricao}</h3>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium">Categoria:</span> {produto.grupos?.nome} / {produto.subgrupos?.nome}
                          </div>
                          <div>
                            <span className="font-medium">Unidade:</span> {produto.unidade_venda}
                          </div>
                          {produto.vasilhames && (
                            <div>
                              <span className="font-medium">Embalagem Padrão:</span> {produto.vasilhames.nome} ({produto.vasilhames.peso_kg} {produto.vasilhames.unidade_base}) • {produto.vasilhames.tipo_calculo === 'peso' ? 'Por Peso' : 'Por Unidade'}
                            </div>
                          )}
                          {produto.vasilhame_secundario && (
                            <div>
                              <span className="font-medium">Embalagem Alt:</span> {produto.vasilhame_secundario.nome} ({produto.vasilhame_secundario.peso_kg} {produto.vasilhame_secundario.unidade_base}) • {produto.vasilhame_secundario.tipo_calculo === 'peso' ? 'Por Peso' : 'Por Unidade'}
                            </div>
                          )}
                          {produto.fornecedores && (
                            <div className="col-span-2">
                              <span className="font-medium">Fornecedor Padrão:</span> {produto.fornecedores.nome_fantasia || produto.fornecedores.razao_social}
                            </div>
                          )}
                          {produto.preco_ultima_compra && (
                            <div>
                              <span className="font-medium">Último Custo:</span> R$ {produto.preco_ultima_compra.toFixed(2)}
                            </div>
                          )}
                          {produto.preco_venda_atual && (
                            <div>
                              <span className="font-medium">Preço Venda:</span> R$ {produto.preco_venda_atual.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setProdutoEditando(produto.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {produtos.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Nenhum produto encontrado
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vasilhames">
            <VasilhamesList />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!produtoEditando} onOpenChange={(open) => !open && setProdutoEditando(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mb-4">
            Edite as informações do produto abaixo. Campos com * são obrigatórios.
          </div>
          <ProdutoForm
            produtoId={produtoEditando}
            onSuccess={() => {
              setProdutoEditando(null);
              queryClient.invalidateQueries({ queryKey: ["produtos-gestao"] });
            }}
            onCancel={() => setProdutoEditando(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

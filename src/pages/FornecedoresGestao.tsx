import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Search, Edit, ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FornecedorForm } from "@/components/fornecedores/FornecedorForm";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FornecedoresGestao() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const [fornecedorEditando, setFornecedorEditando] = useState<string | null>(null);
  const [novoFornecedorModal, setNovoFornecedorModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores-gestao", busca, tipoFiltro],
    queryFn: async () => {
      let query = supabase
        .from("fornecedores")
        .select("*")
        .order("razao_social");

      if (busca) {
        query = query.or(`razao_social.ilike.%${busca}%,nome_fantasia.ilike.%${busca}%,box.ilike.%${busca}%`);
      }

      if (tipoFiltro !== "TODOS") {
        query = query.eq("tipo", tipoFiltro);
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
          <Truck className="h-6 w-6" />
          <h1 className="text-xl font-light tracking-wide">GESTÃO DE FORNECEDORES</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Busca e Filtros */}
        <Card className="sticky top-[60px] z-10 shadow-md">
          <CardContent className="p-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, razão social ou box..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            <div className="flex gap-2 items-center">
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">🔍 Todos</SelectItem>
                  <SelectItem value="PEDRA">🪨 PEDRA (MLP)</SelectItem>
                  <SelectItem value="LOJAS">🏪 LOJAS</SelectItem>
                  <SelectItem value="OUTROS">📦 OUTROS</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => setNovoFornecedorModal(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Fornecedor
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              {fornecedores.length} fornecedores encontrados
            </div>
          </CardContent>
        </Card>

        {/* Lista de Fornecedores */}
        <div className="space-y-2">
          {fornecedores.map((fornecedor: any) => (
            <Card key={fornecedor.id} className="border hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {fornecedor.tipo === "PEDRA" && <span>🪨</span>}
                      {fornecedor.tipo === "LOJAS" && <span>🏪</span>}
                      {fornecedor.tipo === "OUTROS" && <span>📦</span>}
                      
                      <span className="text-xs text-muted-foreground">
                        {fornecedor.tipo}
                      </span>
                      
                      {!fornecedor.ativo && (
                        <Badge variant="outline" className="text-xs">Inativo</Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-sm mb-1">
                      {fornecedor.nome_fantasia || fornecedor.razao_social}
                    </h3>
                    
                    {fornecedor.nome_fantasia && (
                      <div className="text-xs text-muted-foreground mb-2">
                        Razão Social: {fornecedor.razao_social}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {fornecedor.box && (
                        <div>
                          <span className="font-medium">Box/Pedra:</span> {fornecedor.box}
                        </div>
                      )}
                      {fornecedor.contato && (
                        <div>
                          <span className="font-medium">Contato:</span> {fornecedor.contato}
                        </div>
                      )}
                      {fornecedor.telefone && (
                        <div>
                          <span className="font-medium">Telefone:</span> {fornecedor.telefone}
                        </div>
                      )}
                      {fornecedor.endereco && (
                        <div className="col-span-2">
                          <span className="font-medium">Endereço:</span> {fornecedor.endereco}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFornecedorEditando(fornecedor.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {fornecedores.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhum fornecedor encontrado
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={!!fornecedorEditando} onOpenChange={(open) => !open && setFornecedorEditando(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Fornecedor</DialogTitle>
          </DialogHeader>
          <FornecedorForm
            fornecedorId={fornecedorEditando}
            onSuccess={() => {
              setFornecedorEditando(null);
              queryClient.invalidateQueries({ queryKey: ["fornecedores-gestao"] });
              queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
            }}
            onCancel={() => setFornecedorEditando(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Novo Fornecedor */}
      <Dialog open={novoFornecedorModal} onOpenChange={setNovoFornecedorModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Fornecedor</DialogTitle>
          </DialogHeader>
          <FornecedorForm
            fornecedorId={null}
            onSuccess={() => {
              setNovoFornecedorModal(false);
              queryClient.invalidateQueries({ queryKey: ["fornecedores-gestao"] });
              queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
            }}
            onCancel={() => setNovoFornecedorModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

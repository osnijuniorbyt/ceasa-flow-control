import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, Pencil, Trash2, Package, History, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { FornecedorProdutos } from "@/components/fornecedores/FornecedorProdutos";
import { FornecedorHistorico } from "@/components/fornecedores/FornecedorHistorico";
import { FornecedorPerformance } from "@/components/fornecedores/FornecedorPerformance";

export default function Fornecedores() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState<any>(null);
  const [formData, setFormData] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    telefone: "",
    contato: "",
  });

  const queryClient = useQueryClient();

  const { data: fornecedores, isLoading } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("*")
        .order("razao_social");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("fornecedores").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Fornecedor cadastrado!");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("fornecedores")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Fornecedor atualizado!");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("fornecedores")
        .update({ ativo: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Fornecedor desativado!");
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      razao_social: "",
      nome_fantasia: "",
      cnpj: "",
      telefone: "",
      contato: "",
    });
    setEditingFornecedor(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.razao_social.trim()) {
      toast.error("Razão Social é obrigatória");
      return;
    }

    if (editingFornecedor) {
      updateMutation.mutate({ id: editingFornecedor.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (fornecedor: any) => {
    setEditingFornecedor(fornecedor);
    setFormData({
      razao_social: fornecedor.razao_social,
      nome_fantasia: fornecedor.nome_fantasia || "",
      cnpj: fornecedor.cnpj || "",
      telefone: fornecedor.telefone || "",
      contato: fornecedor.contato || "",
    });
    setIsDialogOpen(true);
  };

  const handleViewDetails = (fornecedor: any) => {
    setSelectedFornecedor(fornecedor);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Fornecedores
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie seus fornecedores</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingFornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Razão Social *</Label>
                <Input
                  value={formData.razao_social}
                  onChange={(e) =>
                    setFormData({ ...formData, razao_social: e.target.value })
                  }
                  placeholder="Nome oficial da empresa"
                  required
                />
              </div>

              <div>
                <Label>Nome Fantasia</Label>
                <Input
                  value={formData.nome_fantasia}
                  onChange={(e) =>
                    setFormData({ ...formData, nome_fantasia: e.target.value })
                  }
                  placeholder="Nome comercial"
                />
              </div>

              <div>
                <Label>CNPJ</Label>
                <Input
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <Label>Telefone</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <Label>Contato</Label>
                <Input
                  value={formData.contato}
                  onChange={(e) =>
                    setFormData({ ...formData, contato: e.target.value })
                  }
                  placeholder="Nome do contato"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingFornecedor ? "Atualizar" : "Cadastrar"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : fornecedores && fornecedores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fornecedores.map((fornecedor) => (
            <Card key={fornecedor.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleViewDetails(fornecedor)}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {fornecedor.nome_fantasia || fornecedor.razao_social}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <div className="text-muted-foreground">Razão Social:</div>
                  <div className="font-medium">{fornecedor.razao_social}</div>
                </div>
                {fornecedor.cnpj && (
                  <div className="text-sm">
                    <div className="text-muted-foreground">CNPJ:</div>
                    <div className="font-mono">{fornecedor.cnpj}</div>
                  </div>
                )}
                {fornecedor.contato && (
                  <div className="text-sm">
                    <div className="text-muted-foreground">Contato:</div>
                    <div>{fornecedor.contato}</div>
                  </div>
                )}
                <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(fornecedor)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(fornecedor.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Desativar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum fornecedor cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Cadastre seu primeiro fornecedor para começar
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Fornecedor
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de detalhes com abas */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedFornecedor?.nome_fantasia || selectedFornecedor?.razao_social}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="produtos">
                <Package className="h-4 w-4 mr-2" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="historico">
                <History className="h-4 w-4 mr-2" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="performance">
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 overflow-y-auto">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Razão Social</div>
                    <div className="font-medium">{selectedFornecedor?.razao_social}</div>
                  </div>
                  {selectedFornecedor?.nome_fantasia && (
                    <div>
                      <div className="text-sm text-muted-foreground">Nome Fantasia</div>
                      <div className="font-medium">{selectedFornecedor.nome_fantasia}</div>
                    </div>
                  )}
                  {selectedFornecedor?.cnpj && (
                    <div>
                      <div className="text-sm text-muted-foreground">CNPJ</div>
                      <div className="font-mono">{selectedFornecedor.cnpj}</div>
                    </div>
                  )}
                  {selectedFornecedor?.telefone && (
                    <div>
                      <div className="text-sm text-muted-foreground">Telefone</div>
                      <div>{selectedFornecedor.telefone}</div>
                    </div>
                  )}
                  {selectedFornecedor?.contato && (
                    <div>
                      <div className="text-sm text-muted-foreground">Contato</div>
                      <div>{selectedFornecedor.contato}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="produtos" className="flex-1 overflow-y-auto">
              {selectedFornecedor && (
                <FornecedorProdutos fornecedorId={selectedFornecedor.id} />
              )}
            </TabsContent>

            <TabsContent value="historico" className="flex-1 overflow-y-auto">
              {selectedFornecedor && (
                <FornecedorHistorico fornecedorId={selectedFornecedor.id} />
              )}
            </TabsContent>

            <TabsContent value="performance" className="flex-1 overflow-y-auto">
              {selectedFornecedor && (
                <FornecedorPerformance fornecedorId={selectedFornecedor.id} />
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

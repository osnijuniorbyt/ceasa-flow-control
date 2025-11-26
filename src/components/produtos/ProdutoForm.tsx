import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const produtoSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  descricao: z.string().min(1, "Nome é obrigatório"),
  grupo_id: z.string().min(1, "Categoria é obrigatória"),
  subgrupo_id: z.string().min(1, "Subcategoria é obrigatória"),
  unidade_venda: z.string().min(1, "Unidade é obrigatória"),
  margem_padrao: z.number().optional(),
  preco_ultima_compra: z.number().optional(),
});

interface ProdutoFormProps {
  produtoId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProdutoForm({ produtoId, onSuccess, onCancel }: ProdutoFormProps) {
  const [loading, setLoading] = useState(false);
  const [grupos, setGrupos] = useState<Array<{ id: string; nome: string }>>([]);
  const [subgrupos, setSubgrupos] = useState<Array<{ id: string; nome: string }>>([]);
  const [fornecedores, setFornecedores] = useState<Array<{ id: string; razao_social: string; contato: string | null }>>([]);
  const [vasilhames, setVasilhames] = useState<Array<{ id: string; nome: string; peso_kg: number; unidade_base: string }>>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [formData, setFormData] = useState({
    codigo: "",
    descricao: "",
    grupo_id: "",
    subgrupo_id: "",
    unidade_venda: "kg",
    fornecedor_padrao_id: "",
    vasilhame_padrao_id: "",
    vasilhame_secundario_id: "",
    margem_padrao: "",
    preco_ultima_compra: "",
    ativo: true,
  });

  const { toast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        loadGrupos(),
        loadFornecedores(),
        loadVasilhames(),
      ]);
      
      if (produtoId) {
        await loadProduto();
      }
      
      setIsInitialized(true);
    };
    
    initialize();
  }, [produtoId]);

  useEffect(() => {
    if (formData.grupo_id) {
      loadSubgrupos(formData.grupo_id);
    }
  }, [formData.grupo_id]);

  const loadGrupos = async () => {
    const { data } = await supabase
      .from("grupos")
      .select("id, nome")
      .eq("ativo", true)
      .order("nome");

    if (data) setGrupos(data);
  };

  const loadSubgrupos = async (grupoId: string) => {
    const { data } = await supabase
      .from("subgrupos")
      .select("id, nome")
      .eq("grupo_id", grupoId)
      .eq("ativo", true)
      .order("nome");

    if (data) setSubgrupos(data);
  };

  const loadFornecedores = async () => {
    const { data } = await supabase
      .from("fornecedores")
      .select("id, razao_social, contato")
      .eq("ativo", true)
      .order("razao_social");

    if (data) setFornecedores(data);
  };

  const loadVasilhames = async () => {
    const { data } = await supabase
      .from("vasilhames")
      .select("id, nome, peso_kg, unidade_base")
      .eq("ativo", true)
      .order("nome");

    if (data) setVasilhames(data);
  };

  const loadProduto = async () => {
    if (!produtoId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("id", produtoId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Erro",
          description: "Produto não encontrado",
          variant: "destructive",
        });
        return;
      }

      setFormData({
        codigo: data.codigo,
        descricao: data.descricao,
        grupo_id: data.grupo_id,
        subgrupo_id: data.subgrupo_id,
        unidade_venda: data.unidade_venda,
        fornecedor_padrao_id: data.fornecedor_padrao_id || "",
        vasilhame_padrao_id: data.vasilhame_padrao_id || "",
        vasilhame_secundario_id: data.vasilhame_secundario_id || "",
        margem_padrao: data.margem_padrao?.toString() || "",
        preco_ultima_compra: data.preco_ultima_compra?.toString() || "",
        ativo: data.ativo,
      });
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToValidate = {
        codigo: formData.codigo,
        descricao: formData.descricao,
        grupo_id: formData.grupo_id,
        subgrupo_id: formData.subgrupo_id,
        unidade_venda: formData.unidade_venda,
        margem_padrao: formData.margem_padrao ? parseFloat(formData.margem_padrao) : undefined,
        preco_ultima_compra: formData.preco_ultima_compra ? parseFloat(formData.preco_ultima_compra) : undefined,
      };

      const validation = produtoSchema.safeParse(dataToValidate);
      if (!validation.success) {
        toast({
          title: "Erro de validação",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const dataToSave = {
        codigo: formData.codigo,
        descricao: formData.descricao,
        grupo_id: formData.grupo_id,
        subgrupo_id: formData.subgrupo_id,
        unidade_venda: formData.unidade_venda,
        fornecedor_padrao_id: formData.fornecedor_padrao_id || null,
        vasilhame_padrao_id: formData.vasilhame_padrao_id || null,
        vasilhame_secundario_id: formData.vasilhame_secundario_id || null,
        margem_padrao: formData.margem_padrao ? parseFloat(formData.margem_padrao) : null,
        preco_ultima_compra: formData.preco_ultima_compra ? parseFloat(formData.preco_ultima_compra) : null,
        ativo: formData.ativo,
      };

      
      if (produtoId) {
        const { error } = await supabase
          .from("produtos")
          .update(dataToSave)
          .eq("id", produtoId);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso",
        });
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");
        
        const { error } = await supabase
          .from("produtos")
          .insert({
            ...dataToSave,
            user_id: user.id
          });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Produto cadastrado com sucesso",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fornecedorSelecionado = fornecedores.find(f => f.id === formData.fornecedor_padrao_id);
  const vasilhamePadraoSelecionado = vasilhames.find(v => v.id === formData.vasilhame_padrao_id);
  const vasilhameSecundarioSelecionado = vasilhames.find(v => v.id === formData.vasilhame_secundario_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isInitialized ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando dados...</span>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="codigo">Código *</Label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            placeholder="Ex: ALF001"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Nome do Produto *</Label>
          <Input
            id="descricao"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Ex: Alface Americana"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="grupo_id">Categoria *</Label>
          <Select
            value={formData.grupo_id}
            onValueChange={(value) => setFormData({ ...formData, grupo_id: value, subgrupo_id: "" })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {grupos.map((grupo) => (
                <SelectItem key={grupo.id} value={grupo.id}>
                  {grupo.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subgrupo_id">Subcategoria *</Label>
          <Select
            value={formData.subgrupo_id}
            onValueChange={(value) => setFormData({ ...formData, subgrupo_id: value })}
            disabled={loading || !formData.grupo_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a subcategoria" />
            </SelectTrigger>
            <SelectContent>
              {subgrupos.map((subgrupo) => (
                <SelectItem key={subgrupo.id} value={subgrupo.id}>
                  {subgrupo.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fornecedor_padrao_id">Fornecedor Padrão</Label>
          <Select
            value={formData.fornecedor_padrao_id || undefined}
            onValueChange={(value) => setFormData({ ...formData, fornecedor_padrao_id: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Nenhum" />
            </SelectTrigger>
            <SelectContent>
              {fornecedores.map((fornecedor) => (
                <SelectItem key={fornecedor.id} value={fornecedor.id}>
                  {fornecedor.razao_social}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fornecedorSelecionado?.contato && (
            <p className="text-xs text-muted-foreground">
              Box: {fornecedorSelecionado.contato}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vasilhame_padrao_id">Embalagem Padrão</Label>
          <Select
            value={formData.vasilhame_padrao_id || undefined}
            onValueChange={(value) => setFormData({ ...formData, vasilhame_padrao_id: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Nenhum" />
            </SelectTrigger>
            <SelectContent>
              {vasilhames.map((vasilhame) => (
                <SelectItem key={vasilhame.id} value={vasilhame.id}>
                  {vasilhame.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {vasilhamePadraoSelecionado && (
            <p className="text-xs text-muted-foreground">
              Peso: {vasilhamePadraoSelecionado.peso_kg} kg ({vasilhamePadraoSelecionado.unidade_base})
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vasilhame_secundario_id">Embalagem Alternativa</Label>
          <Select
            value={formData.vasilhame_secundario_id || undefined}
            onValueChange={(value) => setFormData({ ...formData, vasilhame_secundario_id: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Nenhum" />
            </SelectTrigger>
            <SelectContent>
              {vasilhames.map((vasilhame) => (
                <SelectItem key={vasilhame.id} value={vasilhame.id}>
                  {vasilhame.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {vasilhameSecundarioSelecionado && (
            <p className="text-xs text-muted-foreground">
              Peso: {vasilhameSecundarioSelecionado.peso_kg} kg ({vasilhameSecundarioSelecionado.unidade_base})
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unidade_venda">Unidade de Venda *</Label>
        <Select
          value={formData.unidade_venda}
          onValueChange={(value) => setFormData({ ...formData, unidade_venda: value })}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kg">Kg</SelectItem>
            <SelectItem value="cx">Caixa</SelectItem>
            <SelectItem value="un">Unidade</SelectItem>
            <SelectItem value="maço">Maço</SelectItem>
            <SelectItem value="dz">Dúzia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preco_ultima_compra">Preço de Referência (R$)</Label>
          <Input
            id="preco_ultima_compra"
            type="number"
            step="0.01"
            value={formData.preco_ultima_compra}
            onChange={(e) => setFormData({ ...formData, preco_ultima_compra: e.target.value })}
            placeholder="0,00"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="margem_padrao">Margem Padrão (%)</Label>
          <Input
            id="margem_padrao"
            type="number"
            step="0.1"
            value={formData.margem_padrao}
            onChange={(e) => setFormData({ ...formData, margem_padrao: e.target.value })}
            placeholder="30"
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="ativo"
          checked={formData.ativo}
          onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
          disabled={loading}
        />
        <Label htmlFor="ativo">Produto ativo</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
          "Salvar Produto"
        )}
      </Button>
    </div>
    </>
      )}
  </form>
  );
}

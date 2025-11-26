import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const fornecedorSchema = z.object({
  razao_social: z.string().min(1, "Razão social é obrigatória"),
  tipo: z.enum(["PEDRA", "LOJAS", "OUTROS"], {
    errorMap: () => ({ message: "Tipo é obrigatório" }),
  }),
});

interface FornecedorFormProps {
  fornecedorId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FornecedorForm({ fornecedorId, onSuccess, onCancel }: FornecedorFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    tipo: "OUTROS" as "PEDRA" | "LOJAS" | "OUTROS",
    contato: "",
    box: "",
    endereco: "",
    telefone: "",
    ativo: true,
  });

  const { toast } = useToast();

  useEffect(() => {
    if (fornecedorId) {
      loadFornecedor();
    }
  }, [fornecedorId]);

  const loadFornecedor = async () => {
    if (!fornecedorId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("*")
        .eq("id", fornecedorId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Erro",
          description: "Fornecedor não encontrado",
          variant: "destructive",
        });
        return;
      }

      setFormData({
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia || "",
        cnpj: data.cnpj || "",
        tipo: (data.tipo as "PEDRA" | "LOJAS" | "OUTROS") || "OUTROS",
        contato: data.contato || "",
        box: data.box || "",
        endereco: data.endereco || "",
        telefone: data.telefone || "",
        ativo: data.ativo,
      });
    } catch (error) {
      console.error("Erro ao carregar fornecedor:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar fornecedor",
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
        razao_social: formData.razao_social,
        tipo: formData.tipo,
      };

      const validation = fornecedorSchema.safeParse(dataToValidate);
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
        razao_social: formData.razao_social,
        nome_fantasia: formData.nome_fantasia || null,
        cnpj: formData.cnpj || null,
        tipo: formData.tipo,
        contato: formData.contato || null,
        box: formData.box || null,
        endereco: formData.endereco || null,
        telefone: formData.telefone || null,
        ativo: formData.ativo,
      };

      if (fornecedorId) {
        const { error } = await supabase
          .from("fornecedores")
          .update(dataToSave)
          .eq("id", fornecedorId);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Fornecedor atualizado com sucesso",
        });
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");
        
        const { error } = await supabase
          .from("fornecedores")
          .insert({
            ...dataToSave,
            user_id: user.id
          });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Fornecedor cadastrado com sucesso",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar fornecedor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="razao_social">Razão Social *</Label>
          <Input
            id="razao_social"
            value={formData.razao_social}
            onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
            placeholder="Ex: Comercial de Alimentos LTDA"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
          <Input
            id="nome_fantasia"
            value={formData.nome_fantasia}
            onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
            placeholder="Ex: Verduras Frescas"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo / Categoria *</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value: "PEDRA" | "LOJAS" | "OUTROS") => setFormData({ ...formData, tipo: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PEDRA">🪨 PEDRA (MLP)</SelectItem>
              <SelectItem value="LOJAS">🏪 LOJAS</SelectItem>
              <SelectItem value="OUTROS">📦 OUTROS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            value={formData.cnpj}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            placeholder="00.000.000/0000-00"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            placeholder="(00) 00000-0000"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="box">Box / Pedra</Label>
          <Input
            id="box"
            value={formData.box}
            onChange={(e) => setFormData({ ...formData, box: e.target.value })}
            placeholder="Ex: Box 25 ou Pedra A-15"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contato">Contato</Label>
          <Input
            id="contato"
            value={formData.contato}
            onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
            placeholder="Nome do contato"
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endereco">Endereço Completo</Label>
        <Textarea
          id="endereco"
          value={formData.endereco}
          onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
          placeholder="Rua, número, bairro, cidade, estado"
          disabled={loading}
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="ativo"
          checked={formData.ativo}
          onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
          disabled={loading}
        />
        <Label htmlFor="ativo">Fornecedor ativo</Label>
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
            "Salvar Fornecedor"
          )}
        </Button>
      </div>
    </form>
  );
}

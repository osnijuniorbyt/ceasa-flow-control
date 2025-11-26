import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const vasilhameSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo_calculo: z.enum(["peso", "unidade"]),
  peso_embalagem_kg: z.number().min(0, "Peso da embalagem não pode ser negativo"),
  peso_kg: z.number().positive("Peso líquido deve ser maior que zero"),
  unidade_base: z.string().min(1, "Unidade é obrigatória"),
  descricao: z.string().optional(),
  ativo: z.boolean(),
});

type VasilhameFormData = z.infer<typeof vasilhameSchema>;

interface VasilhameFormProps {
  vasilhameId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VasilhameForm({ vasilhameId, onSuccess, onCancel }: VasilhameFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VasilhameFormData>({
    resolver: zodResolver(vasilhameSchema),
    defaultValues: {
      nome: "",
      tipo_calculo: "peso",
      peso_embalagem_kg: 0,
      peso_kg: 1,
      unidade_base: "kg",
      descricao: "",
      ativo: true,
    },
  });

  const ativo = watch("ativo");
  const tipoCalculo = watch("tipo_calculo");

  useEffect(() => {
    if (vasilhameId) {
      loadVasilhame();
    }
  }, [vasilhameId]);

  const loadVasilhame = async () => {
    if (!vasilhameId) return;

    const { data, error } = await supabase
      .from("vasilhames")
      .select("*")
      .eq("id", vasilhameId)
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar a embalagem.",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setValue("nome", data.nome);
      setValue("tipo_calculo", (data.tipo_calculo || "peso") as "peso" | "unidade");
      setValue("peso_embalagem_kg", data.peso_embalagem_kg || 0);
      setValue("peso_kg", data.peso_kg);
      setValue("unidade_base", data.unidade_base);
      setValue("descricao", data.descricao || "");
      setValue("ativo", data.ativo);
    }
  };

  const onSubmit = async (data: VasilhameFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      if (vasilhameId) {
        // Atualizar
        const { error } = await supabase
          .from("vasilhames")
          .update({
            nome: data.nome,
            tipo_calculo: data.tipo_calculo,
            peso_embalagem_kg: data.peso_embalagem_kg,
            peso_kg: data.peso_kg,
            unidade_base: data.unidade_base,
            descricao: data.descricao || null,
            ativo: data.ativo,
          })
          .eq("id", vasilhameId);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Embalagem atualizada com sucesso.",
        });
      } else {
        // Criar
        const { error } = await supabase
          .from("vasilhames")
          .insert({
            nome: data.nome,
            tipo_calculo: data.tipo_calculo,
            peso_embalagem_kg: data.peso_embalagem_kg,
            peso_kg: data.peso_kg,
            unidade_base: data.unidade_base,
            descricao: data.descricao || null,
            ativo: data.ativo,
            user_id: user.id,
          });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Embalagem cadastrada com sucesso.",
        });
      }

      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao salvar embalagem:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar embalagem.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome da Embalagem *</Label>
        <Input
          id="nome"
          {...register("nome")}
          placeholder="Ex: Caixa, Saco, Dúzia, Unidade"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Nome que identifica a embalagem
        </p>
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo_calculo">Tipo de Cálculo *</Label>
        <Select 
          value={tipoCalculo} 
          onValueChange={(value) => setValue("tipo_calculo", value as "peso" | "unidade")}
        >
          <SelectTrigger id="tipo_calculo">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="peso">Por Peso (kg)</SelectItem>
            <SelectItem value="unidade">Por Unidade</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Define se compra/vende por peso ou unidade
        </p>
        {errors.tipo_calculo && (
          <p className="text-sm text-destructive">{errors.tipo_calculo.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="peso_kg">Peso/Quantidade *</Label>
          <Input
            id="peso_kg"
            type="number"
            step="0.01"
            {...register("peso_kg", { valueAsNumber: true })}
            placeholder="Ex: 18"
          />
          <p className="text-xs text-muted-foreground">
            Quantidade líquida do produto
          </p>
          {errors.peso_kg && (
            <p className="text-sm text-destructive">{errors.peso_kg.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unidade_base">Unidade *</Label>
          <Input
            id="unidade_base"
            {...register("unidade_base")}
            placeholder="kg, un, dz"
          />
          <p className="text-xs text-muted-foreground">
            kg, un, dz, cx, sc
          </p>
          {errors.unidade_base && (
            <p className="text-sm text-destructive">{errors.unidade_base.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="peso_embalagem_kg">Peso da Embalagem Vazia</Label>
        <Input
          id="peso_embalagem_kg"
          type="number"
          step="0.01"
          {...register("peso_embalagem_kg", { valueAsNumber: true })}
          placeholder="Ex: 2 (opcional)"
        />
        <p className="text-xs text-muted-foreground">
          Peso só da embalagem em kg (opcional)
        </p>
        {errors.peso_embalagem_kg && (
          <p className="text-sm text-destructive">{errors.peso_embalagem_kg.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Observações</Label>
        <Textarea
          id="descricao"
          {...register("descricao")}
          placeholder="Informações adicionais (opcional)"
          rows={2}
        />
      </div>

      <div className="flex items-center justify-between py-2 border-t">
        <div className="space-y-0.5">
          <Label htmlFor="ativo">Status Ativo</Label>
          <p className="text-xs text-muted-foreground">
            Desative se não usar mais esta embalagem
          </p>
        </div>
        <Switch
          id="ativo"
          checked={ativo}
          onCheckedChange={(checked) => setValue("ativo", checked)}
        />
      </div>

      <div className="flex gap-3 pt-2">
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
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {vasilhameId ? "Atualizar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}

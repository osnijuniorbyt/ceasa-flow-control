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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const vasilhameSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  peso_kg: z.number().positive("Peso deve ser maior que zero"),
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
      peso_kg: 1,
      unidade_base: "kg",
      descricao: "",
      ativo: true,
    },
  });

  const ativo = watch("ativo");

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
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          {...register("nome")}
          placeholder="Ex: KG, CX, SC, DZ"
        />
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome.message}</p>
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
          />
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
          {errors.unidade_base && (
            <p className="text-sm text-destructive">{errors.unidade_base.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          {...register("descricao")}
          placeholder="Detalhes adicionais (opcional)"
          rows={2}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="ativo">Ativo</Label>
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

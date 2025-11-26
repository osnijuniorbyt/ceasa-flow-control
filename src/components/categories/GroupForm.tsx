import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GroupFormData {
  codigo: number;
  nome: string;
}

interface GroupFormProps {
  group?: {
    id: string;
    codigo: number;
    nome: string;
    ativo: boolean;
  };
  onSuccess: () => void;
}

export function GroupForm({ group, onSuccess }: GroupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GroupFormData>({
    defaultValues: group
      ? { codigo: group.codigo, nome: group.nome }
      : undefined,
  });

  const onSubmit = async (data: GroupFormData) => {
    setIsSubmitting(true);

    try {
      if (group) {
        // Update
        const { error } = await supabase
          .from("grupos")
          .update(data)
          .eq("id", group.id);

        if (error) throw error;
      } else {
        // Create
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");
        
        const { error } = await supabase.from("grupos").insert({
          ...data,
          user_id: user.id
        });

        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar grupo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="codigo">Código</Label>
        <Input
          id="codigo"
          type="number"
          {...register("codigo", {
            required: "Código é obrigatório",
            valueAsNumber: true,
            min: { value: 1, message: "Código deve ser maior que 0" },
          })}
        />
        {errors.codigo && (
          <p className="text-sm text-destructive mt-1">
            {errors.codigo.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="nome">Nome do Grupo</Label>
        <Input
          id="nome"
          placeholder="Ex: HORTI, FRUTAS, FRIOS"
          {...register("nome", { required: "Nome é obrigatório" })}
        />
        {errors.nome && (
          <p className="text-sm text-destructive mt-1">{errors.nome.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : group ? "Atualizar" : "Criar Grupo"}
      </Button>
    </form>
  );
}

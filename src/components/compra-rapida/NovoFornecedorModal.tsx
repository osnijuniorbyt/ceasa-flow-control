import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NovoFornecedorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (fornecedorId: string) => void;
}

export function NovoFornecedorModal({ open, onOpenChange, onSuccess }: NovoFornecedorModalProps) {
  const [nome, setNome] = useState("");
  const [box, setBox] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do fornecedor é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("fornecedores")
        .insert({
          razao_social: nome,
          nome_fantasia: nome,
          contato: box,
          ativo: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Fornecedor cadastrado com sucesso",
      });

      setNome("");
      setBox("");
      onOpenChange(false);
      onSuccess(data.id);
    } catch (error) {
      console.error("Erro ao cadastrar fornecedor:", error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar fornecedor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Novo Fornecedor</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-base">Nome *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do fornecedor"
              className="h-14 text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="box" className="text-base">Box / Contato</Label>
            <Input
              id="box"
              value={box}
              onChange={(e) => setBox(e.target.value)}
              placeholder="Box 123 ou telefone"
              className="h-14 text-lg"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-14 text-lg"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-14 text-lg"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

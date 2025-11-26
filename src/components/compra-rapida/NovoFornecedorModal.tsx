import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [tipo, setTipo] = useState("");
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

    if (!tipo) {
      toast({
        title: "Erro",
        description: "Tipo/Local do fornecedor é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("fornecedores")
        .insert({
          razao_social: nome,
          nome_fantasia: nome,
          box: box || null,
          contato: box || null,
          tipo: tipo,
          ativo: true,
          user_id: user.id
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
      setTipo("");
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
      <DialogContent className="w-[90vw] md:w-[85vw] max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">Novo Fornecedor</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-base md:text-lg">Nome *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do fornecedor"
              className="h-14 md:h-16 text-lg md:text-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo" className="text-base md:text-lg">Local / Tipo *</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="h-14 md:h-16 text-lg md:text-xl">
                <SelectValue placeholder="Selecione o local" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CEASA">CEASA</SelectItem>
                <SelectItem value="Pedra">Pedra</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="box" className="text-base md:text-lg">Box / Contato</Label>
            <Input
              id="box"
              value={box}
              onChange={(e) => setBox(e.target.value)}
              placeholder="Box 123 ou telefone"
              className="h-14 md:h-16 text-lg md:text-xl"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-14 md:h-16 text-lg md:text-xl"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-14 md:h-16 text-lg md:text-xl"
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

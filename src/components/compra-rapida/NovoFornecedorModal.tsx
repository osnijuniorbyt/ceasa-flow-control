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
      <DialogContent className="w-[92vw] md:w-[88vw] max-w-lg md:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl">Novo Fornecedor</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="nome" className="text-lg md:text-xl font-semibold">Nome *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do fornecedor"
              className="h-16 md:h-20 text-xl md:text-2xl"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="tipo" className="text-lg md:text-xl font-semibold">Local / Tipo *</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="h-16 md:h-20 text-xl md:text-2xl">
                <SelectValue placeholder="Selecione o local" />
              </SelectTrigger>
              <SelectContent className="text-xl md:text-2xl">
                <SelectItem value="CEASA" className="text-xl md:text-2xl py-4">CEASA</SelectItem>
                <SelectItem value="PEDRA" className="text-xl md:text-2xl py-4">Pedra</SelectItem>
                <SelectItem value="LOJAS" className="text-xl md:text-2xl py-4">Lojas</SelectItem>
                <SelectItem value="OUTROS" className="text-xl md:text-2xl py-4">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label htmlFor="box" className="text-lg md:text-xl font-semibold">Box / Contato</Label>
            <Input
              id="box"
              value={box}
              onChange={(e) => setBox(e.target.value)}
              placeholder="Box 123 ou telefone"
              className="h-16 md:h-20 text-xl md:text-2xl"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-16 md:h-20 text-xl md:text-2xl"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-16 md:h-20 text-xl md:text-2xl"
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

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();

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
      // Debug: Verificar sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Debug - Sessão ativa:', !!session?.access_token);
      console.log('🔐 Debug - User ID:', session?.user?.id);
      console.log('🔐 Debug - User from context:', user?.id);
      
      if (!session?.access_token) {
        toast({
          title: "Erro de Autenticação",
          description: "Sessão expirada. Faça login novamente.",
          variant: "destructive",
        });
        return;
      }
      
      // Não enviar user_id manualmente - deixar o banco usar DEFAULT auth.uid()
      const { data, error } = await supabase
        .from("fornecedores")
        .insert({
          razao_social: nome,
          nome_fantasia: nome,
          box: box || null,
          contato: box || null,
          tipo: tipo,
          ativo: true,
          // user_id será preenchido automaticamente pelo DEFAULT auth.uid()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro Supabase:', error);
        throw error;
      }

      console.log('✅ Fornecedor cadastrado:', data);
      toast({
        title: "Sucesso",
        description: "Fornecedor cadastrado com sucesso",
      });

      setNome("");
      setBox("");
      setTipo("");
      onOpenChange(false);
      onSuccess(data.id);
    } catch (error: any) {
      console.error("❌ Erro ao cadastrar fornecedor:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar fornecedor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] md:w-[88vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Novo Fornecedor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-sm font-semibold">Nome *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do fornecedor"
              className="h-11 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo" className="text-sm font-semibold">Local / Tipo *</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Selecione o local" />
              </SelectTrigger>
              <SelectContent className="text-base">
                <SelectItem value="CEASA" className="text-base py-2">🥬 CEASA</SelectItem>
                <SelectItem value="PEDRA" className="text-base py-2">🪨 Pedra</SelectItem>
                <SelectItem value="LOJAS" className="text-base py-2">🏪 Lojas</SelectItem>
                <SelectItem value="OUTROS" className="text-base py-2">📦 Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="box" className="text-sm font-semibold">Box / Contato</Label>
            <Input
              id="box"
              value={box}
              onChange={(e) => setBox(e.target.value)}
              placeholder="Box 123 ou telefone"
              className="h-11 text-base"
            />
          </div>
          <div className="flex gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 text-base"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-11 text-base"
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

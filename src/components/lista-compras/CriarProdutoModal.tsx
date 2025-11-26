import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CriarProdutoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (produtoId: string) => void;
  searchTerm?: string;
}

export function CriarProdutoModal({
  open,
  onOpenChange,
  onSuccess,
  searchTerm = "",
}: CriarProdutoModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState(searchTerm);
  const [categoria, setCategoria] = useState("");
  const [unidade, setUnidade] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !categoria || !unidade) return;

    setLoading(true);
    try {
      // Buscar grupo e subgrupo baseado na categoria
      const { data: grupos, error: gruposError } = await supabase
        .from("grupos")
        .select("id, subgrupos(id)")
        .eq("ativo", true)
        .limit(1)
        .single();

      if (gruposError) throw gruposError;

      const grupoId = grupos.id;
      const subgrupoId = grupos.subgrupos?.[0]?.id;

      if (!subgrupoId) {
        throw new Error("Nenhum subgrupo disponível");
      }

      // Gerar código único
      const { data: ultimoProduto } = await supabase
        .from("produtos")
        .select("codigo")
        .order("codigo", { ascending: false })
        .limit(1)
        .single();

      const ultimoCodigo = ultimoProduto?.codigo || "0";
      const novoCodigo = (parseInt(ultimoCodigo) + 1).toString().padStart(4, "0");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      // Criar produto
      const { data: produto, error } = await supabase
        .from("produtos")
        .insert({
          codigo: novoCodigo,
          descricao: nome,
          unidade_venda: unidade,
          grupo_id: grupoId,
          subgrupo_id: subgrupoId,
          ativo: true,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Produto criado!",
        description: `${nome} adicionado com sucesso`,
      });

      onSuccess(produto.id);
      onOpenChange(false);
      setNome("");
      setCategoria("");
      setUnidade("");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Produto Novo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Produto*</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Tomate"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria*</Label>
            <Select value={categoria} onValueChange={setCategoria} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frutas">Frutas</SelectItem>
                <SelectItem value="legumes">Legumes</SelectItem>
                <SelectItem value="verduras">Verduras</SelectItem>
                <SelectItem value="ovos">Ovos</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Unidade de Venda*</Label>
            <Select value={unidade} onValueChange={setUnidade} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kg (Quilograma)</SelectItem>
                <SelectItem value="un">Un (Unidade)</SelectItem>
                <SelectItem value="bdj">Bdj (Bandeja)</SelectItem>
                <SelectItem value="cx">Cx (Caixa)</SelectItem>
                <SelectItem value="dz">Dz (Dúzia)</SelectItem>
                <SelectItem value="ml">Ml (Milheiro)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !nome || !categoria || !unidade}>
              {loading ? "Criando..." : "Criar e Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Plus, Box } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VasilhameForm } from "./VasilhameForm";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function VasilhamesList() {
  const [busca, setBusca] = useState("");
  const [vasilhameEditando, setVasilhameEditando] = useState<string | null>(null);
  const [criandoNovo, setCriandoNovo] = useState(false);
  const [vasilhameDeletando, setVasilhameDeletando] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: vasilhames = [] } = useQuery({
    queryKey: ["vasilhames", busca],
    queryFn: async () => {
      let query = supabase
        .from("vasilhames")
        .select("*")
        .order("nome");

      if (busca) {
        query = query.ilike("nome", `%${busca}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const deletarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vasilhames")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vasilhames"] });
      toast({
        title: "Embalagem deletada",
        description: "A embalagem foi removida com sucesso.",
      });
      setVasilhameDeletando(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar",
        description: error.message || "Não foi possível deletar a embalagem.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4">
      {/* Busca e Novo */}
      <Card>
        <CardContent className="p-3">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar embalagem..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <Button onClick={() => setCriandoNovo(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nova
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {vasilhames.length} embalagens cadastradas
          </div>
        </CardContent>
      </Card>

      {/* Lista de Vasilhames */}
      <div className="space-y-2">
        {vasilhames.map((vasilhame: any) => (
          <Card key={vasilhame.id} className="border hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Box className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{vasilhame.nome}</h3>
                      {!vasilhame.ativo && (
                        <Badge variant="outline" className="text-xs">Inativo</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {vasilhame.peso_kg} {vasilhame.unidade_base}
                      {vasilhame.descricao && ` • ${vasilhame.descricao}`}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVasilhameEditando(vasilhame.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVasilhameDeletando(vasilhame.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {vasilhames.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhuma embalagem encontrada
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog Criar */}
      <Dialog open={criandoNovo} onOpenChange={setCriandoNovo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Embalagem</DialogTitle>
          </DialogHeader>
          <VasilhameForm
            onSuccess={() => {
              setCriandoNovo(false);
              queryClient.invalidateQueries({ queryKey: ["vasilhames"] });
            }}
            onCancel={() => setCriandoNovo(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Editar */}
      <Dialog open={!!vasilhameEditando} onOpenChange={(open) => !open && setVasilhameEditando(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Embalagem</DialogTitle>
          </DialogHeader>
          <VasilhameForm
            vasilhameId={vasilhameEditando}
            onSuccess={() => {
              setVasilhameEditando(null);
              queryClient.invalidateQueries({ queryKey: ["vasilhames"] });
            }}
            onCancel={() => setVasilhameEditando(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Deletar */}
      <AlertDialog open={!!vasilhameDeletando} onOpenChange={(open) => !open && setVasilhameDeletando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta embalagem? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => vasilhameDeletando && deletarMutation.mutate(vasilhameDeletando)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

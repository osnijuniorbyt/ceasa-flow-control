import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, FolderTree } from "lucide-react";
import { GroupCard } from "@/components/categories/GroupCard";
import { GroupForm } from "@/components/categories/GroupForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Categories() {
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

  const { data: groups, isLoading, refetch } = useQuery({
    queryKey: ["grupos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grupos")
        .select(`
          *,
          subgrupos (*)
        `)
        .order("codigo");

      if (error) throw error;
      return data;
    },
  });

  const handleGroupCreated = () => {
    setIsGroupDialogOpen(false);
    refetch();
    toast.success("Grupo criado com sucesso!");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderTree className="h-8 w-8 text-primary" />
            Árvore Mercadológica
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie grupos e subgrupos de produtos
          </p>
        </div>
        <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Grupo</DialogTitle>
            </DialogHeader>
            <GroupForm onSuccess={handleGroupCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : groups && groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} onUpdate={refetch} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FolderTree className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum grupo cadastrado</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando seu primeiro grupo da árvore mercadológica
          </p>
          <Button onClick={() => setIsGroupDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Primeiro Grupo
          </Button>
        </div>
      )}
    </div>
  );
}

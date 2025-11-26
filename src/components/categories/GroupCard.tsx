import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, ChevronDown, ChevronUp, Power, PowerOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SubgroupForm } from "./SubgroupForm";
import { GroupForm } from "./GroupForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Subgroup {
  id: string;
  codigo: number;
  nome: string;
  ativo: boolean;
}

interface Group {
  id: string;
  codigo: number;
  nome: string;
  ativo: boolean;
  subgrupos: Subgroup[];
}

interface GroupCardProps {
  group: Group;
  onUpdate: () => void;
}

export function GroupCard({ group, onUpdate }: GroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSubgroupDialogOpen, setIsSubgroupDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubgroup, setEditingSubgroup] = useState<Subgroup | null>(null);

  const handleSubgroupCreated = () => {
    setIsSubgroupDialogOpen(false);
    onUpdate();
    toast.success("Subgrupo criado com sucesso!");
  };

  const handleSubgroupUpdated = () => {
    setEditingSubgroup(null);
    onUpdate();
    toast.success("Subgrupo atualizado com sucesso!");
  };

  const handleGroupUpdated = () => {
    setIsEditDialogOpen(false);
    onUpdate();
    toast.success("Grupo atualizado com sucesso!");
  };

  const toggleGroupStatus = async () => {
    const { error } = await supabase
      .from("grupos")
      .update({ ativo: !group.ativo })
      .eq("id", group.id);

    if (error) {
      toast.error("Erro ao atualizar status do grupo");
      return;
    }

    toast.success(group.ativo ? "Grupo desativado" : "Grupo ativado");
    onUpdate();
  };

  const toggleSubgroupStatus = async (subgroup: Subgroup) => {
    const { error } = await supabase
      .from("subgrupos")
      .update({ ativo: !subgroup.ativo })
      .eq("id", subgroup.id);

    if (error) {
      toast.error("Erro ao atualizar status do subgrupo");
      return;
    }

    toast.success(subgroup.ativo ? "Subgrupo desativado" : "Subgrupo ativado");
    onUpdate();
  };

  return (
    <Card className={!group.ativo ? "opacity-60" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                #{group.codigo}
              </Badge>
              {group.nome}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={group.ativo ? "default" : "destructive"} className="text-xs">
                {group.ativo ? "Ativo" : "Inativo"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {group.subgrupos?.length || 0} subgrupos
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Grupo</DialogTitle>
                </DialogHeader>
                <GroupForm group={group} onSuccess={handleGroupUpdated} />
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  {group.ativo ? (
                    <PowerOff className="h-4 w-4" />
                  ) : (
                    <Power className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {group.ativo ? "Desativar" : "Ativar"} grupo?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {group.ativo
                      ? "O grupo será desativado e não aparecerá mais nas listagens padrão."
                      : "O grupo será reativado e voltará a aparecer nas listagens."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={toggleGroupStatus}>
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-2">
          {group.subgrupos && group.subgrupos.length > 0 ? (
            <div className="space-y-2">
              {group.subgrupos.map((subgroup) => (
                <div
                  key={subgroup.id}
                  className={`flex items-center justify-between p-2 rounded-lg border bg-card ${
                    !subgroup.ativo ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      #{subgroup.codigo}
                    </Badge>
                    <span className="text-sm">{subgroup.nome}</span>
                    {!subgroup.ativo && (
                      <Badge variant="destructive" className="text-xs">
                        Inativo
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Dialog
                      open={editingSubgroup?.id === subgroup.id}
                      onOpenChange={(open) =>
                        setEditingSubgroup(open ? subgroup : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Subgrupo</DialogTitle>
                        </DialogHeader>
                        <SubgroupForm
                          grupoId={group.id}
                          subgroup={subgroup}
                          onSuccess={handleSubgroupUpdated}
                        />
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          {subgroup.ativo ? (
                            <PowerOff className="h-3 w-3" />
                          ) : (
                            <Power className="h-3 w-3" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {subgroup.ativo ? "Desativar" : "Ativar"} subgrupo?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {subgroup.ativo
                              ? "O subgrupo será desativado."
                              : "O subgrupo será reativado."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => toggleSubgroupStatus(subgroup)}
                          >
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum subgrupo cadastrado
            </p>
          )}

          <Dialog
            open={isSubgroupDialogOpen}
            onOpenChange={setIsSubgroupDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
                <Plus className="h-3 w-3" />
                Adicionar Subgrupo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Subgrupo em {group.nome}</DialogTitle>
              </DialogHeader>
              <SubgroupForm
                grupoId={group.id}
                onSuccess={handleSubgroupCreated}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      )}
    </Card>
  );
}

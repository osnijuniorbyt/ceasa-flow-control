import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Lista {
  id: string;
  nome: string;
  data_compra: string;
  status: string;
  observacoes: string | null;
  created_at: string;
}

export default function ListaCompras() {
  const navigate = useNavigate();
  const { listaId } = useParams();
  const { toast } = useToast();
  const [listas, setListas] = useState<Lista[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListas();
  }, []);

  const loadListas = async () => {
    try {
      const { data, error } = await supabase
        .from("listas_compras")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListas(data || []);
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

  const criarNovaLista = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const amanha = format(addDays(new Date(), 1), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("listas_compras")
        .insert({
          nome: `Lista ${format(addDays(new Date(), 1), "dd/MM/yyyy", { locale: ptBR })}`,
          data_compra: amanha,
          status: "rascunho",
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nova lista criada!",
      });

      navigate(`/lista-compras/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      rascunho: { label: "Rascunho", class: "bg-muted text-muted-foreground" },
      pronta: { label: "Pronta", class: "bg-blue-500 text-white" },
      em_execucao: { label: "Em Execução", class: "bg-yellow-500 text-white" },
      finalizada: { label: "Finalizada", class: "bg-green-500 text-white" },
    };
    const statusInfo = statusMap[status] || statusMap.rascunho;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (listaId) {
    // Renderizar detalhes da lista específica
    return null; // Será implementado no próximo componente
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            Lista de Compras
          </h1>
          <p className="text-muted-foreground">Organize suas compras antes do CEASA</p>
        </div>
        <Button onClick={criarNovaLista} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nova Lista
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      ) : listas.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma lista criada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira lista de compras para organizar suas idas ao CEASA
            </p>
            <Button onClick={criarNovaLista}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Lista
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {listas.map((lista) => (
            <Card
              key={lista.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/lista-compras/${lista.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{lista.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Compra em: {format(new Date(lista.data_compra), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  {getStatusBadge(lista.status)}
                </div>
              </CardHeader>
              {lista.observacoes && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{lista.observacoes}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

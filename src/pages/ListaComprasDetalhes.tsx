import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Send, CheckCircle, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AdicionarItemLista } from "@/components/lista-compras/AdicionarItemLista";
import { ItensAgrupadosFornecedor } from "@/components/lista-compras/ItensAgrupadosFornecedor";
import { ExecutarLista } from "@/components/lista-compras/ExecutarLista";
import { ItensLista } from "@/components/lista-compras/ItensLista";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Lista {
  id: string;
  nome: string;
  data_compra: string;
  status: string;
  observacoes: string | null;
}

export default function ListaComprasDetalhes() {
  const { listaId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lista, setLista] = useState<Lista | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (listaId) {
      loadLista();
    }
  }, [listaId]);

  const loadLista = async () => {
    try {
      const { data, error } = await supabase
        .from("listas_compras")
        .select("*")
        .eq("id", listaId)
        .single();

      if (error) throw error;
      setLista(data);
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

  const atualizarStatus = async (novoStatus: string) => {
    try {
      const { error } = await supabase
        .from("listas_compras")
        .update({ status: novoStatus })
        .eq("id", listaId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Lista marcada como ${novoStatus}`,
      });

      setLista(prev => prev ? { ...prev, status: novoStatus } : null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lista) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Lista não encontrada</p>
            <Button onClick={() => navigate("/lista-compras")} className="mt-4">
              Voltar para Listas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/lista-compras")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{lista.nome}</h1>
          <p className="text-muted-foreground">
            Compra em: {format(new Date(lista.data_compra), "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
        
        {lista.status === "rascunho" && (
          <Button onClick={() => atualizarStatus("pronta")}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar como Pronta
          </Button>
        )}
        
        {lista.status === "pronta" && (
          <Button onClick={() => atualizarStatus("em_execucao")}>
            <Play className="h-4 w-4 mr-2" />
            Iniciar Execução
          </Button>
        )}
      </div>

      {lista.status === "rascunho" || lista.status === "pronta" ? (
        <Tabs defaultValue="itens" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="itens">Itens da Lista</TabsTrigger>
            <TabsTrigger value="fornecedores">Por Fornecedor</TabsTrigger>
          </TabsList>

          <TabsContent value="itens" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowAddItem(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            {showAddItem && (
              <AdicionarItemLista
                listaId={lista.id}
                onSuccess={() => {
                  setShowAddItem(false);
                  setRefreshKey(prev => prev + 1);
                }}
                onCancel={() => setShowAddItem(false)}
              />
            )}

            <ItensLista listaId={lista.id} refreshKey={refreshKey} />
          </TabsContent>

          <TabsContent value="fornecedores">
            <ItensAgrupadosFornecedor listaId={lista.id} refreshKey={refreshKey} />
          </TabsContent>
        </Tabs>
      ) : (
        <ExecutarLista listaId={lista.id} />
      )}
    </div>
  );
}

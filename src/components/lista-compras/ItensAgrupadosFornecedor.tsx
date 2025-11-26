import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ItensAgrupadosFornecedorProps {
  listaId: string;
  refreshKey: number;
}

interface ItemLista {
  id: string;
  quantidade: number;
  produtos: {
    codigo: string;
    descricao: string;
    unidade_venda: string;
  };
}

interface FornecedorGroup {
  fornecedorId: string;
  fornecedorNome: string;
  fornecedorTelefone: string | null;
  itens: ItemLista[];
}

export function ItensAgrupadosFornecedor({ listaId, refreshKey }: ItensAgrupadosFornecedorProps) {
  const { toast } = useToast();
  const [grupos, setGrupos] = useState<FornecedorGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItens();
  }, [listaId, refreshKey]);

  const loadItens = async () => {
    try {
      const { data, error } = await supabase
        .from("itens_lista_compras")
        .select(`
          *,
          produtos(codigo, descricao, unidade_venda),
          fornecedores:fornecedor_sugerido_id(id, razao_social, nome_fantasia, telefone)
        `)
        .eq("lista_id", listaId)
        .eq("comprado", false);

      if (error) throw error;

      // Agrupar por fornecedor
      const groupedMap = new Map<string, FornecedorGroup>();

      data?.forEach((item: any) => {
        const fornecedorId = item.fornecedores?.id || "sem-fornecedor";
        const fornecedorNome = item.fornecedores
          ? item.fornecedores.nome_fantasia || item.fornecedores.razao_social
          : "Sem Fornecedor Definido";
        const fornecedorTelefone = item.fornecedores?.telefone || null;

        if (!groupedMap.has(fornecedorId)) {
          groupedMap.set(fornecedorId, {
            fornecedorId,
            fornecedorNome,
            fornecedorTelefone,
            itens: [],
          });
        }

        groupedMap.get(fornecedorId)!.itens.push({
          id: item.id,
          quantidade: item.quantidade,
          produtos: item.produtos,
        });
      });

      setGrupos(Array.from(groupedMap.values()));
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

  const enviarWhatsApp = (grupo: FornecedorGroup) => {
    if (!grupo.fornecedorTelefone) {
      toast({
        title: "Aviso",
        description: "Este fornecedor não possui telefone cadastrado",
        variant: "destructive",
      });
      return;
    }

    let mensagem = `*Pedido para ${grupo.fornecedorNome}*\n\n`;
    grupo.itens.forEach((item) => {
      mensagem += `• ${item.produtos.codigo} - ${item.produtos.descricao}\n  Qtd: ${item.quantidade} ${item.produtos.unidade_venda}\n\n`;
    });

    const telefone = grupo.fornecedorTelefone.replace(/\D/g, "");
    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (grupos.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum item na lista ainda</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {grupos.map((grupo) => (
        <Card key={grupo.fornecedorId}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{grupo.fornecedorNome}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {grupo.itens.length} {grupo.itens.length === 1 ? "item" : "itens"}
              </p>
            </div>
            {grupo.fornecedorTelefone && (
              <Button onClick={() => enviarWhatsApp(grupo)}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Enviar WhatsApp
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {grupo.itens.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {item.produtos.codigo} - {item.produtos.descricao}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantidade} {item.produtos.unidade_venda}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

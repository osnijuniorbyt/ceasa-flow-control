import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2, Trash2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Compra {
  id: string;
  numero_compra: number;
  data_compra: string;
  hora_compra: string;
  valor_total: number;
  status: string;
  observacoes: string | null;
  fornecedores: {
    razao_social: string;
    nome_fantasia: string | null;
    contato: string | null;
  };
}

interface ItemCompra {
  id: string;
  quantidade_vasilhames: number;
  peso_total_kg: number;
  preco_por_kg: number;
  subtotal: number;
  produtos: {
    codigo: string;
    descricao: string;
    unidade_venda: string;
  };
  vasilhames: {
    nome: string;
    unidade_base: string;
    tipo_calculo: string;
  };
}

export default function CompraDetalhes() {
  const { compraId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [compra, setCompra] = useState<Compra | null>(null);
  const [itens, setItens] = useState<ItemCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoStatus, setEditandoStatus] = useState(false);
  const [novoStatus, setNovoStatus] = useState("");

  useEffect(() => {
    loadCompra();
    loadItens();
  }, [compraId]);

  const loadCompra = async () => {
    try {
      const { data, error } = await supabase
        .from("compras")
        .select(`
          *,
          fornecedores:fornecedor_id(razao_social, nome_fantasia, contato)
        `)
        .eq("id", compraId)
        .single();

      if (error) throw error;
      setCompra(data as any);
      setNovoStatus(data.status);
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

  const loadItens = async () => {
    try {
      const { data, error } = await supabase
        .from("itens_compra")
        .select(`
          *,
          produtos:produto_id(codigo, descricao, unidade_venda),
          vasilhames:vasilhame_id(nome, unidade_base, tipo_calculo)
        `)
        .eq("compra_id", compraId);

      if (error) throw error;
      setItens(data as any);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar itens",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const atualizarStatus = async () => {
    try {
      const { error } = await supabase
        .from("compras")
        .update({ status: novoStatus })
        .eq("id", compraId);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
      });

      setCompra((prev) => (prev ? { ...prev, status: novoStatus } : null));
      setEditandoStatus(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deletarCompra = async () => {
    if (!confirm("Tem certeza que deseja deletar esta compra?")) return;

    try {
      // Deletar itens primeiro
      const { error: itensError } = await supabase
        .from("itens_compra")
        .delete()
        .eq("compra_id", compraId);

      if (itensError) throw itensError;

      // Deletar compra
      const { error } = await supabase
        .from("compras")
        .delete()
        .eq("id", compraId);

      if (error) throw error;

      toast({
        title: "Compra deletada!",
      });

      navigate("/compra-rapida");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      rascunho: { label: "Rascunho", variant: "outline" },
      confirmado: { label: "Confirmado", variant: "default" },
      entregue: { label: "Entregue", variant: "secondary" },
    };
    const statusInfo = statusMap[status] || statusMap.rascunho;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-5xl">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!compra) {
    return (
      <div className="container mx-auto p-4 max-w-5xl">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Compra não encontrada</p>
            <Button onClick={() => navigate("/compra-rapida")}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/compra-rapida")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Compra #{compra.numero_compra}</h1>
          <p className="text-muted-foreground">
            {format(new Date(compra.data_compra), "dd/MM/yyyy", { locale: ptBR })} às {compra.hora_compra}
          </p>
        </div>
        <Button variant="destructive" onClick={deletarCompra}>
          <Trash2 className="h-4 w-4 mr-2" />
          Deletar
        </Button>
      </div>

      {/* Informações da Compra */}
      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Fornecedor</p>
            <p className="text-lg font-semibold">
              {compra.fornecedores.nome_fantasia || compra.fornecedores.razao_social}
            </p>
            {compra.fornecedores.contato && (
              <p className="text-sm text-muted-foreground">{compra.fornecedores.contato}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Status</p>
              {editandoStatus ? (
                <div className="flex items-center gap-2 mt-1">
                  <Select value={novoStatus} onValueChange={setNovoStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="entregue">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={atualizarStatus}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditandoStatus(false)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(compra.status)}
                  <Button size="sm" variant="ghost" onClick={() => setEditandoStatus(true)}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold text-primary">R$ {compra.valor_total.toFixed(2)}</p>
            </div>
          </div>

          {compra.observacoes && (
            <div>
              <p className="text-sm text-muted-foreground">Observações</p>
              <p className="text-sm">{compra.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Itens da Compra */}
      <Card>
        <CardHeader>
          <CardTitle>Itens da Compra ({itens.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {itens.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum item nesta compra</p>
          ) : (
            <div className="space-y-3">
              {itens.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-lg">
                        {item.produtos.codigo} - {item.produtos.descricao}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vasilhame: {item.vasilhames.nome}
                      </p>
                    </div>
                    <Badge variant="outline">{item.produtos.unidade_venda}</Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Quantidade</p>
                      <p className="font-medium">{item.quantidade_vasilhames}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{item.vasilhames.tipo_calculo === 'peso' ? 'Peso Total' : 'Quantidade Total'}</p>
                      <p className="font-medium">{item.peso_total_kg.toFixed(2)} {item.vasilhames.unidade_base}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Preço/{item.vasilhames.unidade_base}</p>
                      <p className="font-medium">R$ {item.preco_por_kg.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Subtotal</p>
                      <p className="font-semibold text-lg text-primary">
                        R$ {item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

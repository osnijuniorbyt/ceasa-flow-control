import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardCheck, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ConferenciaMobileProps {
  loteData: string;
  onLoteDataChange: (data: string) => void;
}

export function ConferenciaMobile({ loteData, onLoteDataChange }: ConferenciaMobileProps) {
  const [date, setDate] = useState<Date>(new Date(loteData));

  const { data: comprasLote } = useQuery({
    queryKey: ["compras-lote", loteData],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compras")
        .select(`
          *,
          fornecedores (nome_fantasia, razao_social),
          itens_compra (
            *,
            produtos (codigo, descricao, unidade_venda)
          )
        `)
        .eq("data_compra", loteData)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const dateStr = newDate.toISOString().split('T')[0];
      setDate(newDate);
      onLoteDataChange(dateStr);
    }
  };

  const totalCompras = comprasLote?.reduce((sum, c) => sum + (c.valor_total || 0), 0) || 0;
  const totalItens = comprasLote?.reduce((sum, c) => sum + (c.itens_compra?.length || 0), 0) || 0;

  return (
    <div className="space-y-3 p-2">
      {/* Seletor de Lote/Data */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Lote de Compras
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-muted p-2 rounded">
              <div className="text-xs text-muted-foreground">Compras</div>
              <div className="text-lg font-bold">{comprasLote?.length || 0}</div>
            </div>
            <div className="bg-muted p-2 rounded">
              <div className="text-xs text-muted-foreground">Itens</div>
              <div className="text-lg font-bold">{totalItens}</div>
            </div>
          </div>

          <div className="bg-primary/10 p-2 rounded mt-2">
            <div className="text-xs text-muted-foreground">Total do Lote</div>
            <div className="text-xl font-bold text-primary">R$ {totalCompras.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Compras do Lote */}
      {comprasLote && comprasLote.length > 0 ? (
        <div className="space-y-2">
          {comprasLote.map((compra) => (
            <Card key={compra.id} className="border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-sm">
                      #{compra.numero_compra} - {compra.fornecedores?.nome_fantasia || compra.fornecedores?.razao_social}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {compra.itens_compra?.length || 0} itens
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      R$ {compra.valor_total.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {compra.status}
                    </div>
                  </div>
                </div>

                {/* Itens da Compra */}
                <div className="space-y-1 mt-2 border-t pt-2">
                  {compra.itens_compra?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="truncate">
                        {item.produtos?.codigo} - {item.produtos?.descricao}
                      </span>
                      <span className="font-medium ml-2">
                        {item.quantidade_vasilhames} {item.produtos?.unidade_venda}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground text-sm">
            <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma compra registrada neste lote</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

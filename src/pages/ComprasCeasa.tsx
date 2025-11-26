import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, FileText, Building2 } from "lucide-react";
import { CompraRapida } from "@/components/compras-ceasa/CompraRapida";
import { CompraPorPedido } from "@/components/compras-ceasa/CompraPorPedido";
import { CompraPorFornecedor } from "@/components/compras-ceasa/CompraPorFornecedor";

export default function ComprasCeasa() {
  const [activeTab, setActiveTab] = useState("rapida");

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-8 w-8 text-primary" />
          Central de Compras CEASA
        </h1>
        <p className="text-muted-foreground mt-1">
          3 formas de registrar suas compras
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rapida" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Compra Rápida
          </TabsTrigger>
          <TabsTrigger value="pedido" className="gap-2">
            <FileText className="h-4 w-4" />
            Por Pedido
          </TabsTrigger>
          <TabsTrigger value="fornecedor" className="gap-2">
            <Building2 className="h-4 w-4" />
            Por Fornecedor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rapida" className="mt-6">
          <CompraRapida />
        </TabsContent>

        <TabsContent value="pedido" className="mt-6">
          <CompraPorPedido />
        </TabsContent>

        <TabsContent value="fornecedor" className="mt-6">
          <CompraPorFornecedor />
        </TabsContent>
      </Tabs>
    </div>
  );
}

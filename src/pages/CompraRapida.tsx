import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, DollarSign } from "lucide-react";
import { RegistroCompra } from "@/components/compra-rapida/RegistroCompra";
import { TabelaPrecos } from "@/components/compra-rapida/TabelaPrecos";

export default function CompraRapida() {
  const [activeTab, setActiveTab] = useState("registro");

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Compra Rápida</h1>
        <p className="text-muted-foreground">Registre compras e gerencie preços</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 mb-6">
          <TabsTrigger value="registro" className="text-lg">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Registro de Compra
          </TabsTrigger>
          <TabsTrigger value="precos" className="text-lg">
            <DollarSign className="h-5 w-5 mr-2" />
            Tabela de Preços
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registro">
          <RegistroCompra />
        </TabsContent>

        <TabsContent value="precos">
          <TabelaPrecos />
        </TabsContent>
      </Tabs>
    </div>
  );
}

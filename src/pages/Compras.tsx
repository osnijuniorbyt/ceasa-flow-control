
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { 
  ShoppingBag, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Search,
  CheckSquare,
  Send,
  FileText,
  Save,
  Smartphone
} from "lucide-react";
import { PurchaseDashboard } from "@/components/compras/PurchaseDashboard";
import { AutoSuggestedList } from "@/components/compras/AutoSuggestedList";
import { SmartInsights } from "@/components/compras/SmartInsights";
import { SupplierQuickView } from "@/components/compras/SupplierQuickView";
import { toast } from "sonner";

export default function Compras() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleSelectAll = () => {
    toast.success("Todos os produtos com estoque baixo foram selecionados");
  };

  const handleConfirmSelected = () => {
    if (selectedProducts.length === 0) {
      toast.error("Selecione pelo menos um produto");
      return;
    }
    toast.success(`${selectedProducts.length} produtos confirmados para pedido`);
  };

  const handleSendWhatsApp = () => {
    if (selectedProducts.length === 0) {
      toast.error("Selecione produtos antes de enviar");
      return;
    }
    toast.success("Lista enviada via WhatsApp para fornecedores");
  };

  const handleSaveDraft = () => {
    toast.success("Pedido salvo como rascunho");
  };

  const handleGeneratePDF = () => {
    toast.success("Lista de compras PDF gerada com sucesso");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Central de Compras
          </h2>
          <p className="text-muted-foreground">
            Gestão inteligente de compras com sugestões automáticas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <PurchaseDashboard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AutoSuggestedList 
            searchTerm={searchTerm}
            selectedProducts={selectedProducts}
            onSelectionChange={setSelectedProducts}
          />
          
          <SmartInsights />
        </div>
        
        <div className="space-y-6">
          <SupplierQuickView />
        </div>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Button 
              variant="outline" 
              onClick={handleSelectAll}
              className="w-full"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Selecionar Baixo Estoque
            </Button>
            
            <Button 
              onClick={handleConfirmSelected}
              className="w-full"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Confirmar Selecionados
            </Button>
            
            <Button 
              variant="outline"
              className="w-full"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Ajustar Quantidades
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleSendWhatsApp}
              className="w-full bg-green-50 hover:bg-green-100 border-green-200"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Enviar WhatsApp
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleSaveDraft}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Rascunho
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleGeneratePDF}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

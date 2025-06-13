
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Percent,
  DollarSign,
  Filter,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface BulkUpdateItem {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  newPrice: number;
  change: number;
  selected: boolean;
  validation: "valid" | "warning" | "error";
  message?: string;
}

export function BulkPriceUpdater() {
  const [updateMethod, setUpdateMethod] = useState<"percentage" | "fixed" | "csv">("percentage");
  const [percentageValue, setPercentageValue] = useState(5);
  const [fixedValue, setFixedValue] = useState(1.00);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [csvData, setCsvData] = useState("");

  const [bulkItems, setBulkItems] = useState<BulkUpdateItem[]>([
    {
      id: "P001",
      name: "Alface hidropônica",
      category: "Verduras",
      currentPrice: 4.80,
      newPrice: 5.04,
      change: 5,
      selected: true,
      validation: "valid"
    },
    {
      id: "P002",
      name: "Tomate grape",
      category: "Legumes",
      currentPrice: 7.50,
      newPrice: 7.88,
      change: 5,
      selected: true,
      validation: "valid"
    },
    {
      id: "P003",
      name: "Moranguinho",
      category: "Frutas",
      currentPrice: 14.00,
      newPrice: 14.70,
      change: 5,
      selected: false,
      validation: "warning",
      message: "Preço pode estar alto para o mercado"
    },
    {
      id: "P004",
      name: "Batata doce branca",
      category: "Tubérculos",
      currentPrice: 4.20,
      newPrice: 4.41,
      change: 5,
      selected: true,
      validation: "valid"
    }
  ]);

  const categories = ["all", "Verduras", "Legumes", "Frutas", "Tubérculos"];

  const applyBulkUpdate = () => {
    setBulkItems(prev => prev.map(item => {
      if (!item.selected) return item;
      
      let newPrice = item.currentPrice;
      let change = 0;
      
      switch (updateMethod) {
        case "percentage":
          newPrice = item.currentPrice * (1 + percentageValue / 100);
          change = percentageValue;
          break;
        case "fixed":
          newPrice = item.currentPrice + fixedValue;
          change = (fixedValue / item.currentPrice) * 100;
          break;
      }
      
      // Validation logic
      let validation: "valid" | "warning" | "error" = "valid";
      let message = undefined;
      
      if (newPrice > item.currentPrice * 1.2) {
        validation = "warning";
        message = "Aumento superior a 20%";
      }
      if (newPrice < item.currentPrice * 0.8) {
        validation = "error";
        message = "Redução superior a 20%";
      }
      
      return {
        ...item,
        newPrice: Math.round(newPrice * 100) / 100,
        change: Math.round(change * 10) / 10,
        validation,
        message
      };
    }));
  };

  const toggleItemSelection = (id: string) => {
    setBulkItems(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const selectAllItems = () => {
    setBulkItems(prev => prev.map(item => ({ ...item, selected: true })));
  };

  const deselectAllItems = () => {
    setBulkItems(prev => prev.map(item => ({ ...item, selected: false })));
  };

  const getValidationBadge = (validation: string, message?: string) => {
    switch (validation) {
      case "error":
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800">OK</Badge>;
    }
  };

  const filteredItems = bulkItems.filter(item => 
    selectedCategory === "all" || item.category === selectedCategory
  );

  const selectedCount = filteredItems.filter(item => item.selected).length;
  const totalImpact = filteredItems
    .filter(item => item.selected)
    .reduce((sum, item) => sum + (item.newPrice - item.currentPrice), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Atualização em Lote de Preços
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Atualize múltiplos preços simultaneamente com validação automática
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Method Selection */}
            <div className="space-y-4">
              <h3 className="font-medium">Método de Atualização</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="percentage"
                    name="method"
                    checked={updateMethod === "percentage"}
                    onChange={() => setUpdateMethod("percentage")}
                  />
                  <Label htmlFor="percentage" className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Percentual
                  </Label>
                </div>
                
                {updateMethod === "percentage" && (
                  <div className="ml-6">
                    <Input
                      type="number"
                      value={percentageValue}
                      onChange={(e) => setPercentageValue(parseFloat(e.target.value) || 0)}
                      placeholder="5"
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground ml-2">%</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="fixed"
                    name="method"
                    checked={updateMethod === "fixed"}
                    onChange={() => setUpdateMethod("fixed")}
                  />
                  <Label htmlFor="fixed" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor Fixo
                  </Label>
                </div>
                
                {updateMethod === "fixed" && (
                  <div className="ml-6">
                    <Input
                      type="number"
                      value={fixedValue}
                      onChange={(e) => setFixedValue(parseFloat(e.target.value) || 0)}
                      placeholder="1.00"
                      step="0.01"
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground ml-2">R$</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="csv"
                    name="method"
                    checked={updateMethod === "csv"}
                    onChange={() => setUpdateMethod("csv")}
                  />
                  <Label htmlFor="csv" className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Importar CSV
                  </Label>
                </div>
                
                {updateMethod === "csv" && (
                  <div className="ml-6 space-y-2">
                    <Textarea
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      placeholder="ID,NovoPreco&#10;P001,5.20&#10;P002,8.00"
                      rows={4}
                    />
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Template
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Filtrar por Categoria</Label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === "all" ? "Todas as categorias" : category}
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={applyBulkUpdate} className="w-full">
                Aplicar Atualização
              </Button>
            </div>

            {/* Preview and Selection */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Pré-visualização ({selectedCount} selecionados)</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllItems}>
                    Selecionar Todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllItems}>
                    Desmarcar Todos
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg">
                <div className="max-h-96 overflow-y-auto">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border-b last:border-b-0">
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={() => toggleItemSelection(item.id)}
                      />
                      
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.category}</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">R$ {item.currentPrice.toFixed(2)}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">R$ {item.newPrice.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getValidationBadge(item.validation, item.message)}
                        {item.validation === "valid" && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {item.validation !== "valid" && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Resumo da Atualização</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-blue-600 font-medium">{selectedCount}</div>
                    <div className="text-blue-700">Produtos selecionados</div>
                  </div>
                  <div>
                    <div className="text-blue-600 font-medium">
                      {totalImpact >= 0 ? '+' : ''}R$ {totalImpact.toFixed(2)}
                    </div>
                    <div className="text-blue-700">Impacto total</div>
                  </div>
                  <div>
                    <div className="text-blue-600 font-medium">
                      {filteredItems.filter(i => i.selected && i.validation !== "valid").length}
                    </div>
                    <div className="text-blue-700">Com alertas</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  disabled={selectedCount === 0}
                >
                  Confirmar Atualizações ({selectedCount})
                </Button>
                <Button variant="outline">
                  Salvar Rascunho
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

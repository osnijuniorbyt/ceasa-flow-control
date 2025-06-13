
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Percent,
  DollarSign,
  FileSpreadsheet,
  Download
} from "lucide-react";
import { UpdateMethod } from "./BulkUpdateTypes";

interface UpdateMethodSelectorProps {
  updateMethod: UpdateMethod;
  setUpdateMethod: (method: UpdateMethod) => void;
  percentageValue: number;
  setPercentageValue: (value: number) => void;
  fixedValue: number;
  setFixedValue: (value: number) => void;
  csvData: string;
  setCsvData: (data: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  onApplyUpdate: () => void;
}

export function UpdateMethodSelector({
  updateMethod,
  setUpdateMethod,
  percentageValue,
  setPercentageValue,
  fixedValue,
  setFixedValue,
  csvData,
  setCsvData,
  selectedCategory,
  setSelectedCategory,
  categories,
  onApplyUpdate
}: UpdateMethodSelectorProps) {
  return (
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

      <Button onClick={onApplyUpdate} className="w-full">
        Aplicar Atualização
      </Button>
    </div>
  );
}

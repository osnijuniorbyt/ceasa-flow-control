
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Método de Atualização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={updateMethod} onValueChange={(value: UpdateMethod) => setUpdateMethod(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentual</SelectItem>
              <SelectItem value="fixed">Valor Fixo</SelectItem>
              <SelectItem value="csv">Importar CSV</SelectItem>
            </SelectContent>
          </Select>

          {updateMethod === "percentage" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Percentual (%)</label>
              <Input
                type="number"
                value={percentageValue}
                onChange={(e) => setPercentageValue(Number(e.target.value))}
                placeholder="Ex: 5 para +5%"
              />
            </div>
          )}

          {updateMethod === "fixed" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Fixo (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={fixedValue}
                onChange={(e) => setFixedValue(Number(e.target.value))}
                placeholder="Ex: 1.50"
              />
            </div>
          )}

          {updateMethod === "csv" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Dados CSV</label>
              <Textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="ID,Novo Preço&#10;P001,5.50&#10;P002,8.00"
                rows={4}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "Todas as categorias" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onApplyUpdate} className="w-full">
            Aplicar Atualização
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

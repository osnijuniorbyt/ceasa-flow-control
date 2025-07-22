import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, X } from "lucide-react";
import { NumberInput } from "@/components/mobile/NumberInput";
import { toast } from "sonner";
import { FastCheckoutProduct } from "@/types/fastCheckout";
import { PurchaseService } from "@/services/purchaseService";

const CATEGORIES = [
  "Hortifruti",
  "Açougue",
  "Padaria",
  "Laticínios",
  "Bebidas",
  "Mercearia",
  "Limpeza",
  "Outros"
];

const UNITS = ["kg", "un", "cx", "pc", "lt", "g"];

interface AddNewProductFormProps {
  onProductAdded: (product: FastCheckoutProduct) => void;
}

export function AddNewProductForm({ onProductAdded }: AddNewProductFormProps) {
  const [open, setOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [unit, setUnit] = useState(UNITS[0]);
  const [currentStock, setCurrentStock] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [supplier, setSupplier] = useState("");
  const [targetQuantity, setTargetQuantity] = useState(1);
  const [dailySales, setDailySales] = useState(0);

  const clearForm = () => {
    setProductName("");
    setCategory(CATEGORIES[0]);
    setUnit(UNITS[0]);
    setCurrentStock(0);
    setUnitPrice(0);
    setSupplier("");
    setTargetQuantity(1);
    setDailySales(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }

    if (unitPrice <= 0) {
      toast.error("Preço unitário deve ser maior que zero");
      return;
    }

    // Create new product
    const newProduct: FastCheckoutProduct = {
      id: crypto.randomUUID(),
      name: productName,
      category,
      currentStock,
      originalStock: currentStock,
      unit,
      stockLevel: getStockLevel(currentStock, dailySales),
      suggestedQuantity: calculateSuggestedQuantity(currentStock, dailySales),
      targetQuantity,
      lastSupplier: supplier,
      lastPrice: unitPrice,
      unitPrice,
      supplierRating: "good",
      supplierNote: "",
      dailySales,
      isSelected: true,
      paymentMethod: "BOLETO",
      daysToPayment: 30
    };

    // Add to service
    PurchaseService.addNewProduct(newProduct);
    
    // Notify parent
    onProductAdded(newProduct);
    
    toast.success(`Produto "${productName}" adicionado com sucesso`);
    setOpen(false);
    clearForm();
  };

  const getStockLevel = (stock: number, sales: number) => {
    if (sales === 0) return "medium";
    const daysLeft = stock / sales;
    if (daysLeft < 2) return "critical";
    if (daysLeft < 5) return "low";
    if (daysLeft < 10) return "medium";
    return "good";
  };

  const calculateSuggestedQuantity = (stock: number, sales: number) => {
    if (sales === 0) return 10;
    // Suggest enough for 14 days minus current stock
    const suggestion = Math.max(Math.ceil(sales * 14 - stock), 1);
    return suggestion;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Novo Produto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nome do Produto*</label>
              <Input 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex: Tomate Italiano"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Unidade</label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Estoque Atual</label>
                <NumberInput
                  value={currentStock}
                  onChange={setCurrentStock}
                  min={0}
                  max={9999}
                  allowDecimal={true}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Vendas Diárias</label>
                <NumberInput
                  value={dailySales}
                  onChange={setDailySales}
                  min={0}
                  max={9999}
                  allowDecimal={true}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Preço Unitário*</label>
                <NumberInput
                  value={unitPrice}
                  onChange={setUnitPrice}
                  min={0.01}
                  max={9999}
                  allowDecimal={true}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Quantidade a Comprar</label>
                <NumberInput
                  value={targetQuantity}
                  onChange={setTargetQuantity}
                  min={1}
                  max={9999}
                  allowDecimal={false}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Fornecedor</label>
              <Input 
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Ex: Distribuidora Alimentos Ltda"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Adicionar Produto</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
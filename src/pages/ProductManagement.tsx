
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  TrendingUp,
  TrendingDown 
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  pricePerUnit: number;
  supplier: string;
  location: string;
  lastRestocked: string;
  status: "normal" | "low" | "critical" | "overstock";
}

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const products: Product[] = [
    {
      id: "P001",
      name: "Alface hidropônica",
      category: "Verduras",
      currentStock: 45,
      unit: "unidades",
      minStock: 20,
      maxStock: 80,
      pricePerUnit: 3.50,
      supplier: "D22 Hidropônicos",
      location: "A1-001",
      lastRestocked: "2024-01-15",
      status: "normal"
    },
    {
      id: "P002",
      name: "Moranguinho",
      category: "Frutas",
      currentStock: 12,
      unit: "bandejas",
      minStock: 15,
      maxStock: 50,
      pricePerUnit: 8.00,
      supplier: "F59 Frutas Premium",
      location: "B1-001",
      lastRestocked: "2024-01-14",
      status: "low"
    },
    {
      id: "P003",
      name: "Tomate grape",
      category: "Legumes",
      currentStock: 3,
      unit: "kg",
      minStock: 10,
      maxStock: 40,
      pricePerUnit: 12.00,
      supplier: "E10 Orgânicos",
      location: "A1-002",
      lastRestocked: "2024-01-12",
      status: "critical"
    },
    {
      id: "P004",
      name: "Alho descascado 500g",
      category: "Temperos",
      currentStock: 25,
      unit: "pacotes",
      minStock: 10,
      maxStock: 30,
      pricePerUnit: 15.50,
      supplier: "E104 Temperos",
      location: "A2-003",
      lastRestocked: "2024-01-13",
      status: "normal"
    },
    {
      id: "P005",
      name: "Baroa granel",
      category: "Tubérculos",
      currentStock: 85,
      unit: "kg",
      minStock: 20,
      maxStock: 60,
      pricePerUnit: 6.80,
      supplier: "F100 Tubérculos",
      location: "C1-001",
      lastRestocked: "2024-01-16",
      status: "overstock"
    },
    {
      id: "P006",
      name: "Batata doce branca",
      category: "Tubérculos",
      currentStock: 8,
      unit: "kg",
      minStock: 15,
      maxStock: 50,
      pricePerUnit: 4.20,
      supplier: "H55 Raízes",
      location: "C1-002",
      lastRestocked: "2024-01-11",
      status: "low"
    },
    {
      id: "P007",
      name: "Rúcula orgânica",
      category: "Verduras",
      currentStock: 32,
      unit: "maços",
      minStock: 25,
      maxStock: 60,
      pricePerUnit: 4.50,
      supplier: "D22 Hidropônicos",
      location: "A1-003",
      lastRestocked: "2024-01-15",
      status: "normal"
    },
    {
      id: "P008",
      name: "Cenoura baby",
      category: "Legumes",
      currentStock: 18,
      unit: "kg",
      minStock: 12,
      maxStock: 35,
      pricePerUnit: 7.90,
      supplier: "V33 Vegetais",
      location: "A1-004",
      lastRestocked: "2024-01-14",
      status: "normal"
    }
  ];

  const categories = ["all", "Verduras", "Frutas", "Legumes", "Tubérculos", "Temperos"];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Crítico</Badge>;
      case "low":
        return <Badge className="bg-yellow-100 text-yellow-800">Baixo</Badge>;
      case "overstock":
        return <Badge className="bg-blue-100 text-blue-800">Excesso</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800">Normal</Badge>;
    }
  };

  const getStockIcon = (current: number, min: number, max: number) => {
    if (current <= min * 0.5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    if (current >= max * 0.9) return <TrendingUp className="h-4 w-4 text-blue-500" />;
    return null;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = products.reduce((sum, product) => sum + (product.currentStock * product.pricePerUnit), 0);
  const criticalProducts = products.filter(p => p.status === "critical").length;
  const lowStockProducts = products.filter(p => p.status === "low").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Produtos</h2>
          <p className="text-muted-foreground">
            Controle completo de produtos CEASA
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Em estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Crítico</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalProducts}</div>
            <p className="text-xs text-muted-foreground">Produtos em falta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">Necessita reposição</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Produtos</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "Todas as categorias" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Preço/Unidade</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getStockIcon(product.currentStock, product.minStock, product.maxStock)}
                      {product.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.currentStock} {product.unit}</div>
                      <div className="text-xs text-muted-foreground">
                        Min: {product.minStock} | Max: {product.maxStock}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell>R$ {product.pricePerUnit.toFixed(2)}</TableCell>
                  <TableCell className="text-sm">{product.supplier}</TableCell>
                  <TableCell>{product.location}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

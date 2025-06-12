
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Search, Plus, AlertTriangle } from "lucide-react";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");

  const products = [
    {
      id: "P001",
      name: "Tomate",
      category: "Legumes",
      quantity: 150,
      unit: "kg",
      minStock: 50,
      supplier: "Fornecedor ABC",
      location: "A1-001",
      expiryDate: "2024-01-20",
    },
    {
      id: "P002",
      name: "Alface",
      category: "Verduras",
      quantity: 25,
      unit: "unidades",
      minStock: 30,
      supplier: "Verduras Frescas",
      location: "B1-005",
      expiryDate: "2024-01-18",
    },
    {
      id: "P003",
      name: "Banana",
      category: "Frutas",
      quantity: 200,
      unit: "kg",
      minStock: 100,
      supplier: "Hortifruti XYZ",
      location: "C1-012",
      expiryDate: "2024-01-22",
    },
  ];

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= minStock) {
      return { label: "Estoque Baixo", color: "bg-red-100 text-red-800" };
    } else if (quantity <= minStock * 1.5) {
      return { label: "Atenção", color: "bg-yellow-100 text-yellow-800" };
    }
    return { label: "Normal", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventário</h2>
          <p className="text-muted-foreground">
            Controle de estoque e produtos
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
            <CardTitle className="text-sm font-medium">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              Em 145 categorias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.670</div>
            <p className="text-xs text-muted-foreground">
              Em estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produtos Vencendo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Próximos 3 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estoque Baixo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Produtos em alerta
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.quantity, product.minStock);
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{product.name}</h4>
                      <Badge className={stockStatus.color}>
                        {stockStatus.label}
                      </Badge>
                      <Badge variant="outline">
                        {product.category}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p><strong>Quantidade:</strong> {product.quantity} {product.unit}</p>
                        <p><strong>Estoque Mín:</strong> {product.minStock} {product.unit}</p>
                      </div>
                      <div>
                        <p><strong>Fornecedor:</strong> {product.supplier}</p>
                        <p><strong>Localização:</strong> {product.location}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Validade:</strong> {product.expiryDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button size="sm">
                      Movimentar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Package } from "lucide-react";

export function ProductPerformance() {
  const productData = [
    {
      id: "P001",
      name: "Alface hidropônica",
      category: "Verduras",
      totalSold: 245,
      revenue: "R$ 857,50",
      growth: "+12%",
      trend: "up",
      margin: "42%",
      stockTurns: 8.2
    },
    {
      id: "P002",
      name: "Tomate grape",
      category: "Legumes",
      totalSold: 180,
      revenue: "R$ 2.160,00",
      growth: "+8%",
      trend: "up",
      margin: "38%",
      stockTurns: 6.5
    },
    {
      id: "P003",
      name: "Moranguinho",
      category: "Frutas",
      totalSold: 95,
      revenue: "R$ 760,00",
      growth: "-5%",
      trend: "down",
      margin: "45%",
      stockTurns: 4.2
    },
    {
      id: "P004",
      name: "Alho descascado 500g",
      category: "Temperos",
      totalSold: 156,
      revenue: "R$ 2.418,00",
      growth: "+15%",
      trend: "up",
      margin: "52%",
      stockTurns: 9.1
    },
    {
      id: "P005",
      name: "Baroa granel",
      category: "Tubérculos",
      totalSold: 320,
      revenue: "R$ 2.176,00",
      growth: "+3%",
      trend: "up",
      margin: "35%",
      stockTurns: 5.8
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Análise de Performance de Produtos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Qtd. Vendida</TableHead>
              <TableHead>Receita</TableHead>
              <TableHead>Crescimento</TableHead>
              <TableHead>Margem</TableHead>
              <TableHead>Giro Estoque</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productData.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{product.category}</Badge>
                </TableCell>
                <TableCell>{product.totalSold}</TableCell>
                <TableCell className="font-medium">{product.revenue}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {product.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={product.trend === "up" ? "text-green-600" : "text-red-600"}>
                      {product.growth}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{product.margin}</TableCell>
                <TableCell>{product.stockTurns}x</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

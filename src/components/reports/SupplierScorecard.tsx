
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Star, Clock, TrendingUp } from "lucide-react";

export function SupplierScorecard() {
  const supplierData = [
    {
      id: "S001",
      name: "D22 Hidropônicos",
      score: 92,
      deliveryTime: 98,
      quality: 95,
      priceCompetitive: 88,
      reliability: 94,
      totalOrders: 48,
      onTimeDelivery: "96%",
      qualityRating: 4.8,
      status: "Excelente"
    },
    {
      id: "S002",
      name: "F59 Frutas Premium",
      score: 87,
      deliveryTime: 85,
      quality: 92,
      priceCompetitive: 82,
      reliability: 89,
      totalOrders: 32,
      onTimeDelivery: "89%",
      qualityRating: 4.6,
      status: "Bom"
    },
    {
      id: "S003",
      name: "E10 Orgânicos",
      score: 78,
      deliveryTime: 75,
      quality: 88,
      priceCompetitive: 70,
      reliability: 79,
      totalOrders: 28,
      onTimeDelivery: "82%",
      qualityRating: 4.4,
      status: "Regular"
    },
    {
      id: "S004",
      name: "H55 Raízes",
      score: 85,
      deliveryTime: 88,
      quality: 84,
      priceCompetitive: 85,
      reliability: 83,
      totalOrders: 24,
      onTimeDelivery: "91%",
      qualityRating: 4.2,
      status: "Bom"
    },
    {
      id: "S005",
      name: "V33 Vegetais",
      score: 90,
      deliveryTime: 92,
      quality: 89,
      priceCompetitive: 88,
      reliability: 91,
      totalOrders: 36,
      onTimeDelivery: "94%",
      qualityRating: 4.5,
      status: "Excelente"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Excelente":
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
      case "Bom":
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
      case "Regular":
        return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Scorecard de Fornecedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Score Geral</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Pontualidade</TableHead>
                <TableHead>Qualidade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierData.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={supplier.score} className="w-16" />
                      <span className="text-sm font-medium">{supplier.score}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{supplier.totalOrders}</TableCell>
                  <TableCell>{supplier.onTimeDelivery}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{supplier.qualityRating}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {supplierData.slice(0, 3).map((supplier) => (
          <Card key={supplier.id}>
            <CardHeader>
              <CardTitle className="text-lg">{supplier.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Score Geral</span>
                <div className="flex items-center gap-2">
                  <Progress value={supplier.score} className="w-20" />
                  <span className="font-bold">{supplier.score}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Tempo de Entrega</span>
                  <span className="text-sm font-medium">{supplier.deliveryTime}%</span>
                </div>
                <Progress value={supplier.deliveryTime} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Qualidade</span>
                  <span className="text-sm font-medium">{supplier.quality}%</span>
                </div>
                <Progress value={supplier.quality} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Competitividade</span>
                  <span className="text-sm font-medium">{supplier.priceCompetitive}%</span>
                </div>
                <Progress value={supplier.priceCompetitive} className="h-2" />
              </div>

              <div className="pt-2 border-t">
                {getStatusBadge(supplier.status)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Phone, Star, Clock, Package } from "lucide-react";
import { Supplier } from "@/types/compras";

export function SupplierQuickView() {
  const suppliers: Supplier[] = [
    {
      id: "S001",
      name: "João Silva",
      code: "D22 rua",
      location: "Setor D, Box 22",
      rating: 4.8,
      reliability: 98,
      lastOrderDate: "2024-01-15",
      specialties: ["Verduras", "Temperos"],
      contact: "(11) 99999-1234",
      notes: "Sempre pontual, produtos frescos",
      totalOrders: 45,
      onTimeDelivery: 98
    },
    {
      id: "S002",
      name: "Maria Santos",
      code: "E10",
      location: "Setor E, Box 10",
      rating: 4.9,
      reliability: 95,
      lastOrderDate: "2024-01-14",
      specialties: ["Frutas", "Morangos"],
      contact: "(11) 98888-5678",
      notes: "Melhor qualidade de morangos",
      totalOrders: 38,
      onTimeDelivery: 95
    },
    {
      id: "S003",
      name: "Carlos Oliveira",
      code: "F59",
      location: "Setor F, Box 59",
      rating: 3.8,
      reliability: 75,
      lastOrderDate: "2024-01-13",
      specialties: ["Legumes", "Tomates"],
      contact: "(11) 97777-9012",
      notes: "Preços competitivos, qualidade variável",
      totalOrders: 22,
      onTimeDelivery: 75
    },
    {
      id: "S004",
      name: "Ana Costa",
      code: "E104",
      location: "Setor E, Box 104",
      rating: 4.5,
      reliability: 90,
      lastOrderDate: "2024-01-12",
      specialties: ["Tubérculos", "Raízes"],
      contact: "(11) 96666-3456",
      notes: "Especialista em batatas e mandioca",
      totalOrders: 31,
      onTimeDelivery: 90
    }
  ];

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 95) return "text-green-600";
    if (reliability >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <Star className="h-3 w-3 fill-yellow-400/50 text-yellow-400" />}
        <span className="text-xs text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Fornecedores
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Seus parceiros de confiança
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="p-4 border rounded-lg space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{supplier.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {supplier.code}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {supplier.location}
                  </p>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Phone className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Avaliação:</span>
                  {getRatingStars(supplier.rating)}
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span>Pontualidade:</span>
                  <span className={`font-medium ${getReliabilityColor(supplier.reliability)}`}>
                    {supplier.reliability}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span>Pedidos:</span>
                  <span className="text-muted-foreground">{supplier.totalOrders}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {supplier.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground italic">
                "{supplier.notes}"
              </p>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Histórico
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                  <Package className="h-3 w-3 mr-1" />
                  Produtos
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { WeighingInterface } from "@/components/receiving/WeighingInterface";
import { ProductSelection } from "@/components/receiving/ProductSelection";
import { DivergenceAlert } from "@/components/receiving/DivergenceAlert";
import { ReceivingStats } from "@/components/receiving/ReceivingStats";
import { ProductReceiving, WeighingRecord } from "@/types/receiving";

export default function WarehouseReceiving() {
  const [selectedProduct, setSelectedProduct] = useState<ProductReceiving | null>(null);
  const [weighingRecords, setWeighingRecords] = useState<WeighingRecord[]>([]);
  const [showDivergenceAlert, setShowDivergenceAlert] = useState(false);

  const pendingProducts: ProductReceiving[] = [
    {
      id: "P001",
      name: "Alface hidroponica",
      expectedQuantity: 20,
      expectedWeight: 15,
      unit: "unidades",
      supplier: "D22 rua",
      category: "Verduras"
    },
    {
      id: "P002", 
      name: "Tomate grape",
      expectedQuantity: 10,
      expectedWeight: 8,
      unit: "kg",
      supplier: "E10",
      category: "Legumes"
    },
    {
      id: "P003",
      name: "Moranguinho",
      expectedQuantity: 15,
      unit: "unidades",
      supplier: "F59",
      category: "Frutas"
    }
  ];

  const handleWeighingComplete = (record: WeighingRecord) => {
    setWeighingRecords(prev => [...prev, record]);
    
    // Check for divergences
    if (selectedProduct && record.hasDivergence) {
      setShowDivergenceAlert(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            Recebimento - Conferente
          </h2>
          <p className="text-muted-foreground">
            Interface de pesagem e conferência de produtos
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Usuário: Conferente
        </Badge>
      </div>

      <ReceivingStats records={weighingRecords} />

      <div className="grid gap-6 md:grid-cols-2">
        <ProductSelection 
          products={pendingProducts}
          selectedProduct={selectedProduct}
          onProductSelect={setSelectedProduct}
        />
        
        {selectedProduct && (
          <WeighingInterface 
            product={selectedProduct}
            onWeighingComplete={handleWeighingComplete}
          />
        )}
      </div>

      {showDivergenceAlert && selectedProduct && (
        <DivergenceAlert 
          product={selectedProduct}
          onClose={() => setShowDivergenceAlert(false)}
        />
      )}

      {weighingRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registros de Pesagem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weighingRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {pendingProducts.find(p => p.id === record.productId)?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Container: {record.containerType} | Peso líquido: {record.netWeight}kg
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.hasDivergence ? (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Divergência
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Conforme
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

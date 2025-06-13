
import { useState } from "react";
import { TouchCard } from "../TouchCard";
import { TouchButton } from "../TouchButton";
import { LoadingSkeleton } from "../LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  Search, 
  Phone, 
  MessageCircle,
  Package,
  Clock,
  CheckCircle 
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  supplier: string;
  price: number;
  stock: number;
  category: string;
  urgency: "high" | "medium" | "low";
  lastOrder: string;
}

export function CompradorInterface() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<string[]>([]);

  const products: Product[] = [
    {
      id: "P001",
      name: "Alface Hidropônica",
      supplier: "D22 RUA",
      price: 18.00,
      stock: 2,
      category: "Verduras",
      urgency: "high",
      lastOrder: "Ontem"
    },
    {
      id: "P002", 
      name: "Moranguinho",
      supplier: "E10",
      price: 45.00,
      stock: 1,
      category: "Frutas",
      urgency: "high",
      lastOrder: "2 dias"
    },
    {
      id: "P003",
      name: "Tomate Grape",
      supplier: "F59",
      price: 25.00,
      stock: 3,
      category: "Legumes",
      urgency: "medium",
      lastOrder: "Hoje"
    }
  ];

  const urgencyColors = {
    high: "text-red-600 bg-red-50 border-red-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200", 
    low: "text-green-600 bg-green-50 border-green-200"
  };

  const urgencyLabels = {
    high: "Crítico",
    medium: "Baixo",
    low: "Normal"
  };

  const handleAddToCart = (productId: string) => {
    setCart(prev => [...prev, productId]);
    toast.success("Produto adicionado ao carrinho!");
  };

  const handleContactSupplier = (supplier: string, method: "phone" | "whatsapp") => {
    if (method === "whatsapp") {
      // In a real app, this would open WhatsApp
      toast.success(`Abrindo WhatsApp para ${supplier}`);
    } else {
      toast.success(`Ligando para ${supplier}`);
    }
  };

  const handleQuickOrder = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCart([]);
      toast.success(`${cart.length} pedidos confirmados!`);
    }, 2000);
  };

  if (isLoading) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  return (
    <div className="space-y-6 p-4 pb-24">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <TouchCard size="sm" variant="filled">
          <div className="text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold text-red-600">3</div>
            <div className="text-sm text-muted-foreground">Críticos</div>
          </div>
        </TouchCard>
        
        <TouchCard size="sm" variant="filled">
          <div className="text-center">
            <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{cart.length}</div>
            <div className="text-sm text-muted-foreground">No Carrinho</div>
          </div>
        </TouchCard>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {products
          .filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((product) => (
            <TouchCard key={product.id} size="lg" variant="outline">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{product.name}</h3>
                    <p className="text-muted-foreground">{product.category}</p>
                  </div>
                  <Badge className={urgencyColors[product.urgency]}>
                    {urgencyLabels[product.urgency]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Fornecedor:</span>
                    <p className="font-medium">{product.supplier}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estoque:</span>
                    <p className="font-medium">{product.stock} cx</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Preço:</span>
                    <p className="font-medium text-lg">R$ {product.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Último pedido:</span>
                    <p className="font-medium">{product.lastOrder}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <TouchButton
                    onClick={() => handleAddToCart(product.id)}
                    size="md"
                    className="flex-1"
                    disabled={cart.includes(product.id)}
                  >
                    {cart.includes(product.id) ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Adicionado
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Adicionar
                      </>
                    )}
                  </TouchButton>
                  
                  <TouchButton
                    variant="outline"
                    size="md"
                    onClick={() => handleContactSupplier(product.supplier, "phone")}
                  >
                    <Phone className="h-5 w-5" />
                  </TouchButton>
                  
                  <TouchButton
                    variant="outline"
                    size="md"
                    onClick={() => handleContactSupplier(product.supplier, "whatsapp")}
                    className="bg-green-50 border-green-200 text-green-700"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </TouchButton>
                </div>
              </div>
            </TouchCard>
          ))}
      </div>

      {/* Quick Order Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-24 left-4 right-4 z-40">
          <TouchButton
            onClick={handleQuickOrder}
            size="xl"
            fullWidth
            className="shadow-lg"
          >
            <ShoppingCart className="h-6 w-6 mr-2" />
            Finalizar Pedidos ({cart.length})
          </TouchButton>
        </div>
      )}
    </div>
  );
}

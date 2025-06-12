
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Product } from "@/types/inventory";
import { ProductCard } from "./ProductCard";
import { InventorySearch } from "./InventorySearch";

interface InventoryProductListProps {
  products: Product[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function InventoryProductList({ 
  products, 
  searchTerm, 
  onSearchChange 
}: InventoryProductListProps) {
  return (
    <Card>
      <CardHeader>
        <InventorySearch 
          searchTerm={searchTerm} 
          onSearchChange={onSearchChange} 
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

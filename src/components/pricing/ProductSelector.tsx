
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  units: number;
}

interface ProductSelectorProps {
  products: Product[];
  selectedProduct: string;
  onProductChange: (productId: string) => void;
}

export function ProductSelector({ products, selectedProduct, onProductChange }: ProductSelectorProps) {
  return (
    <div>
      <Label htmlFor="product">Produto</Label>
      <select 
        id="product"
        value={selectedProduct}
        onChange={(e) => onProductChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        {products.map(product => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </select>
    </div>
  );
}

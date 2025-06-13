
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ProductCategory } from "@/types/product";

interface ProductFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: ProductCategory[];
}

export default function ProductFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories
}: ProductFiltersProps) {
  return (
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
  );
}

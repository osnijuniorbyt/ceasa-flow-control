import { Card, CardContent } from "@/components/ui/card";
import { useFastCheckoutState } from "@/hooks/useFastCheckoutState";
import { FastCheckoutBulkControls } from "./FastCheckoutBulkControls";
import { FastCheckoutProductItem } from "./FastCheckoutProductItem";
import { FastCheckoutActionButtons } from "./FastCheckoutActionButtons";
import { FastCheckoutSummaryHeader } from "./FastCheckoutSummaryHeader";
import { FastCheckoutShortcuts } from "./FastCheckoutShortcuts";
import { AddNewProductForm } from "./AddNewProductForm";
import { DataStorage } from "./DataStorage";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export function FastCheckout() {
  const {
    products,
    allSelected,
    selectedProducts,
    totalValue,
    totalItems,
    loading,
    handleProductToggle,
    handleQuantityChange,
    handlePriceChange,
    handleSelectAll,
    handleKeyPress,
    handleConfirmOrders,
    handleClearSelections,
    handleAddProduct
  } = useFastCheckoutState();

  const uniqueSuppliersCount = new Set(selectedProducts.map(p => p.lastSupplier)).size;

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="h-20 bg-muted rounded-lg animate-pulse" />
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <FastCheckoutSummaryHeader totalValue={totalValue} totalItems={totalItems} />
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <FastCheckoutBulkControls
            allSelected={allSelected}
            selectedCount={selectedProducts.length}
            totalCount={products.length}
            onSelectAll={handleSelectAll}
          />

          <div className="space-y-3">
            {products.map((product) => (
              <FastCheckoutProductItem
                key={product.id}
                product={product}
                onToggle={handleProductToggle}
                onQuantityChange={handleQuantityChange}
                onPriceChange={handlePriceChange}
                onKeyPress={handleKeyPress}
              />
            ))}
          </div>

          <FastCheckoutActionButtons
            selectedCount={selectedProducts.length}
            onConfirm={handleConfirmOrders}
            onClear={handleClearSelections}
          />
          
          <Separator className="my-4" />
          
          <div>
            <AddNewProductForm onProductAdded={(product) => {
              // The service already handles adding the product to localStorage
              // Update the state with the new product
              handleAddProduct(product);
              toast.success(`Produto "${product.name}" adicionado à lista de compras`);
            }} />
          </div>

          <FastCheckoutShortcuts uniqueSuppliersCount={uniqueSuppliersCount} />
          
          <Separator className="my-4" />
          
          <DataStorage />
        </CardContent>
      </Card>
    </div>
  );
}

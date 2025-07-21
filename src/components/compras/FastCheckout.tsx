import { Card, CardContent } from "@/components/ui/card";
import { useFastCheckoutState } from "@/hooks/useFastCheckoutState";
import { FastCheckoutBulkControls } from "./FastCheckoutBulkControls";
import { FastCheckoutProductItem } from "./FastCheckoutProductItem";
import { FastCheckoutActionButtons } from "./FastCheckoutActionButtons";
import { FastCheckoutSummaryHeader } from "./FastCheckoutSummaryHeader";
import { FastCheckoutShortcuts } from "./FastCheckoutShortcuts";

export function FastCheckout() {
  const {
    products,
    allSelected,
    selectedProducts,
    totalValue,
    totalItems,
    handleProductToggle,
    handleQuantityChange,
    handlePriceChange,
    handleSelectAll,
    handleKeyPress,
    handleConfirmOrders,
    handleClearSelections
  } = useFastCheckoutState();

  const uniqueSuppliersCount = new Set(selectedProducts.map(p => p.lastSupplier)).size;

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

          <FastCheckoutShortcuts uniqueSuppliersCount={uniqueSuppliersCount} />
        </CardContent>
      </Card>
    </div>
  );
}

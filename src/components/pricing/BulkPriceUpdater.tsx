
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Shield } from "lucide-react";
import { UpdateMethodSelector } from "./UpdateMethodSelector";
import { ItemPreview } from "./ItemPreview";
import { ValidationSummary } from "./ValidationSummary";
import { BulkControls } from "./BulkControls";
import { SecureForm } from "@/components/security/SecureForm";
import { useBulkUpdateLogic } from "./BulkUpdateLogic";

export function BulkPriceUpdater() {
  const {
    updateMethod,
    setUpdateMethod,
    percentageValue,
    handlePercentageChange,
    fixedValue,
    handleFixedValueChange,
    csvData,
    handleCsvDataChange,
    selectedCategory,
    setSelectedCategory,
    categories,
    filteredItems,
    applyBulkUpdate,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    handleConfirmUpdates
  } = useBulkUpdateLogic();

  const selectedCount = filteredItems.filter(item => item.selected).length;
  const totalImpact = filteredItems
    .filter(item => item.selected)
    .reduce((sum, item) => sum + (item.newPrice - item.currentPrice), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Atualização em Lote de Preços
            <Shield className="h-4 w-4 text-green-600" />
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Atualize múltiplos preços com validação de segurança e auditoria integradas
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <UpdateMethodSelector
              updateMethod={updateMethod}
              setUpdateMethod={setUpdateMethod}
              percentageValue={percentageValue}
              setPercentageValue={handlePercentageChange}
              fixedValue={fixedValue}
              setFixedValue={handleFixedValueChange}
              csvData={csvData}
              setCsvData={handleCsvDataChange}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              onApplyUpdate={applyBulkUpdate}
            />

            <div className="md:col-span-2 space-y-4">
              <ItemPreview
                filteredItems={filteredItems}
                selectedCount={selectedCount}
                onToggleItemSelection={toggleItemSelection}
                onSelectAllItems={selectAllItems}
                onDeselectAllItems={deselectAllItems}
              />

              <ValidationSummary
                filteredItems={filteredItems}
                selectedCount={selectedCount}
                totalImpact={totalImpact}
              />

              <SecureForm 
                onSubmit={(data, csrfToken) => handleConfirmUpdates(data, csrfToken, filteredItems)} 
                formId="bulk-price-update"
              >
                <BulkControls selectedCount={selectedCount} />
              </SecureForm>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

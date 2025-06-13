
interface FastCheckoutQuickInfoProps {
  selectedProducts: any[];
}

export function FastCheckoutQuickInfo({ selectedProducts }: FastCheckoutQuickInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg text-sm">
      <div>
        <span className="font-medium">Atalhos:</span> Space = Selecionar, Enter = Confirmar
      </div>
      <div>
        <span className="font-medium">Fornecedores:</span> {new Set(selectedProducts.map(p => p.lastSupplier)).size} únicos
      </div>
      <div>
        <span className="font-medium">Integração:</span> Controle de pagamentos automático
      </div>
    </div>
  );
}

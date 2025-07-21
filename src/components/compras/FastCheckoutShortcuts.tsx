interface FastCheckoutShortcutsProps {
  uniqueSuppliersCount: number;
}

export function FastCheckoutShortcuts({ uniqueSuppliersCount }: FastCheckoutShortcutsProps) {
  return (
    <div className="text-xs text-muted-foreground text-center p-2 bg-muted/30 rounded">
      <div className="grid grid-cols-1 gap-1">
        <span>Atalhos: Toque para selecionar</span>
        <span>Fornecedores: {uniqueSuppliersCount} únicos</span>
      </div>
    </div>
  );
}
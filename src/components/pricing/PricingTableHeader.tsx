
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function PricingTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Produto</TableHead>
        <TableHead>Preço Atual</TableHead>
        <TableHead>Preço Sugerido</TableHead>
        <TableHead>Margem</TableHead>
        <TableHead>Tendência</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
}

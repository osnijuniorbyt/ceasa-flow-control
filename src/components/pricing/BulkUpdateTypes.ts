
export interface BulkUpdateItem {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  newPrice: number;
  change: number;
  selected: boolean;
  validation: "valid" | "warning" | "error";
  message?: string;
}

export type UpdateMethod = "percentage" | "fixed" | "csv";

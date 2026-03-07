
export interface Product {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  pricePerUnit: number;
  supplier: string;
  location: string;
  lastRestocked: string;
  status: "normal" | "low" | "critical" | "overstock";
}

export interface DbProduct {
  id: string;
  codigo: string;
  descricao: string;
  unidade_venda: string;
  ativo: boolean;
  grupo_id: string;
  subgrupo_id: string;
  preco_ultima_compra: number | null;
  vasilhame_padrao_id: string | null;
  vasilhame_secundario_id: string | null;
  vasilhame_ultima_compra_id: string | null;
  vasilhame_padrao?: {
    id: string;
    nome: string;
    peso_kg: number;
  };
  vasilhame_secundario?: {
    id: string;
    nome: string;
    peso_kg: number;
  };
  vasilhame_ultima_compra?: {
    id: string;
    nome: string;
    peso_kg: number;
  };
  fornecedores?: {
    id: string;
    nome_fantasia: string | null;
    razao_social: string;
  };
}

export type ProductCategory = "all" | "Verduras" | "Frutas" | "Legumes" | "Tubérculos" | "Temperos";

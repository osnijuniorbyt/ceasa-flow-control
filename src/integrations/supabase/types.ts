export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      compras: {
        Row: {
          created_at: string
          data_compra: string
          forma_pagamento: string | null
          fornecedor_id: string
          hora_compra: string
          id: string
          numero_compra: number
          observacoes: string | null
          status: string
          valor_produtos: number
          valor_total: number
        }
        Insert: {
          created_at?: string
          data_compra?: string
          forma_pagamento?: string | null
          fornecedor_id: string
          hora_compra?: string
          id?: string
          numero_compra: number
          observacoes?: string | null
          status?: string
          valor_produtos?: number
          valor_total?: number
        }
        Update: {
          created_at?: string
          data_compra?: string
          forma_pagamento?: string | null
          fornecedor_id?: string
          hora_compra?: string
          id?: string
          numero_compra?: number
          observacoes?: string | null
          status?: string
          valor_produtos?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "compras_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          ativo: boolean
          cnpj: string | null
          contato: string | null
          created_at: string
          id: string
          nome_fantasia: string | null
          razao_social: string
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          cnpj?: string | null
          contato?: string | null
          created_at?: string
          id?: string
          nome_fantasia?: string | null
          razao_social: string
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          cnpj?: string | null
          contato?: string | null
          created_at?: string
          id?: string
          nome_fantasia?: string | null
          razao_social?: string
          telefone?: string | null
        }
        Relationships: []
      }
      grupos: {
        Row: {
          ativo: boolean
          codigo: number
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: number
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: number
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      itens_compra: {
        Row: {
          compra_id: string
          created_at: string
          id: string
          margem_aplicada: number | null
          peso_total_kg: number
          preco_por_kg: number
          preco_por_vasilhame: number
          preco_venda_sugerido: number | null
          produto_id: string
          quantidade_vasilhames: number
          subtotal: number
          vasilhame_id: string
        }
        Insert: {
          compra_id: string
          created_at?: string
          id?: string
          margem_aplicada?: number | null
          peso_total_kg: number
          preco_por_kg: number
          preco_por_vasilhame: number
          preco_venda_sugerido?: number | null
          produto_id: string
          quantidade_vasilhames: number
          subtotal: number
          vasilhame_id: string
        }
        Update: {
          compra_id?: string
          created_at?: string
          id?: string
          margem_aplicada?: number | null
          peso_total_kg?: number
          preco_por_kg?: number
          preco_por_vasilhame?: number
          preco_venda_sugerido?: number | null
          produto_id?: string
          quantidade_vasilhames?: number
          subtotal?: number
          vasilhame_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_compra_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_compra_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_compra_vasilhame_id_fkey"
            columns: ["vasilhame_id"]
            isOneToOne: false
            referencedRelation: "vasilhames"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          data_ultima_compra: string | null
          descricao: string
          grupo_id: string
          id: string
          margem_padrao: number | null
          preco_ultima_compra: number | null
          referencia: string | null
          subgrupo_id: string
          unidade_venda: string
          updated_at: string
          vasilhame_ultima_compra_id: string | null
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          data_ultima_compra?: string | null
          descricao: string
          grupo_id: string
          id?: string
          margem_padrao?: number | null
          preco_ultima_compra?: number | null
          referencia?: string | null
          subgrupo_id: string
          unidade_venda: string
          updated_at?: string
          vasilhame_ultima_compra_id?: string | null
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          data_ultima_compra?: string | null
          descricao?: string
          grupo_id?: string
          id?: string
          margem_padrao?: number | null
          preco_ultima_compra?: number | null
          referencia?: string | null
          subgrupo_id?: string
          unidade_venda?: string
          updated_at?: string
          vasilhame_ultima_compra_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_subgrupo_id_fkey"
            columns: ["subgrupo_id"]
            isOneToOne: false
            referencedRelation: "subgrupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_vasilhame_ultima_compra_id_fkey"
            columns: ["vasilhame_ultima_compra_id"]
            isOneToOne: false
            referencedRelation: "vasilhames"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subgrupos: {
        Row: {
          ativo: boolean
          codigo: number
          created_at: string
          grupo_id: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: number
          created_at?: string
          grupo_id: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: number
          created_at?: string
          grupo_id?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subgrupos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      vasilhames: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          peso_kg: number
          unidade_base: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          peso_kg: number
          unidade_base: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          peso_kg?: number
          unidade_base?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

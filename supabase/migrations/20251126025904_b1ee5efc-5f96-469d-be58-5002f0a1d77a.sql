-- ============================================
-- SISTEMA OPERACIONAL DE COMPRAS CEASA
-- Schema completo com tabelas, índices, triggers e RLS
-- ============================================

-- 1. TABELA PRODUTOS
-- ============================================
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_interno TEXT NOT NULL UNIQUE,
  codigo_barras TEXT,
  nome TEXT NOT NULL,
  categoria TEXT,
  subcategoria TEXT,
  unidade_compra TEXT NOT NULL,
  unidade_venda TEXT,
  ncm TEXT CHECK (length(ncm) = 8 OR ncm IS NULL),
  margem_sugerida DECIMAL(5,2),
  preco_ultima_compra DECIMAL(10,2),
  data_ultima_compra TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Índices para produtos
CREATE INDEX idx_produtos_nome ON public.produtos(nome);
CREATE INDEX idx_produtos_codigo_interno ON public.produtos(codigo_interno);
CREATE INDEX idx_produtos_categoria ON public.produtos(categoria);
CREATE INDEX idx_produtos_ativo ON public.produtos(ativo);

-- 2. TABELA FORNECEDORES
-- ============================================
CREATE TABLE public.fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT UNIQUE,
  contato TEXT,
  telefone TEXT,
  ativo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Índices para fornecedores
CREATE INDEX idx_fornecedores_razao_social ON public.fornecedores(razao_social);
CREATE INDEX idx_fornecedores_cnpj ON public.fornecedores(cnpj);
CREATE INDEX idx_fornecedores_ativo ON public.fornecedores(ativo);

-- 3. TABELA COMPRAS
-- ============================================
CREATE TABLE public.compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_compra INTEGER UNIQUE NOT NULL,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE RESTRICT,
  data_compra DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_compra TIME NOT NULL DEFAULT CURRENT_TIME,
  valor_produtos DECIMAL(12,2) DEFAULT 0 NOT NULL,
  valor_total DECIMAL(12,2) DEFAULT 0 NOT NULL,
  forma_pagamento TEXT,
  status TEXT DEFAULT 'rascunho' NOT NULL CHECK (status IN ('rascunho', 'finalizada', 'cancelada')),
  xml_gerado BOOLEAN DEFAULT false NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Índices para compras
CREATE INDEX idx_compras_fornecedor ON public.compras(fornecedor_id);
CREATE INDEX idx_compras_data ON public.compras(data_compra);
CREATE INDEX idx_compras_status ON public.compras(status);
CREATE INDEX idx_compras_numero ON public.compras(numero_compra);

-- 4. TABELA ITENS_COMPRA
-- ============================================
CREATE TABLE public.itens_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id UUID NOT NULL REFERENCES public.compras(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  quantidade DECIMAL(10,3) NOT NULL,
  unidade TEXT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0 NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  margem_aplicada DECIMAL(5,2),
  preco_venda_sugerido DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Índices para itens_compra
CREATE INDEX idx_itens_compra_compra ON public.itens_compra(compra_id);
CREATE INDEX idx_itens_compra_produto ON public.itens_compra(produto_id);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger para produtos
CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar numero_compra sequencial
CREATE OR REPLACE FUNCTION public.gerar_numero_compra()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.numero_compra IS NULL THEN
    SELECT COALESCE(MAX(numero_compra), 0) + 1 
    INTO NEW.numero_compra 
    FROM public.compras;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para gerar numero_compra automaticamente
CREATE TRIGGER trigger_gerar_numero_compra
  BEFORE INSERT ON public.compras
  FOR EACH ROW
  EXECUTE FUNCTION public.gerar_numero_compra();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_compra ENABLE ROW LEVEL SECURITY;

-- Políticas temporárias permissivas (ajustar quando implementar autenticação)
-- Estas políticas permitem acesso completo temporariamente

CREATE POLICY "Permitir acesso completo a produtos"
  ON public.produtos
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir acesso completo a fornecedores"
  ON public.fornecedores
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir acesso completo a compras"
  ON public.compras
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir acesso completo a itens_compra"
  ON public.itens_compra
  FOR ALL
  USING (true)
  WITH CHECK (true);
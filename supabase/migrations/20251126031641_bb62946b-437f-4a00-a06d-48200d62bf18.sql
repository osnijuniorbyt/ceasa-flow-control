-- REESTRUTURAÇÃO COMPLETA DO BANCO DE DADOS
-- Drop das tabelas antigas na ordem correta (dependentes primeiro)
DROP TABLE IF EXISTS public.itens_compra CASCADE;
DROP TABLE IF EXISTS public.compras CASCADE;
DROP TABLE IF EXISTS public.produtos CASCADE;
DROP TABLE IF EXISTS public.fornecedores CASCADE;

-- Criação da nova estrutura

-- 1. GRUPOS (Árvore Mercadológica - Nível 1)
CREATE TABLE public.grupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo INTEGER UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. SUBGRUPOS (Árvore Mercadológica - Nível 2)
CREATE TABLE public.subgrupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON DELETE RESTRICT,
  codigo INTEGER UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. VASILHAMES (Embalagens/Tipos de Caixa)
CREATE TABLE public.vasilhames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT UNIQUE NOT NULL,
  unidade_base TEXT NOT NULL,
  peso_kg NUMERIC NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. FORNECEDORES
CREATE TABLE public.fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT UNIQUE,
  contato TEXT,
  telefone TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. PRODUTOS
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  referencia TEXT,
  descricao TEXT NOT NULL,
  grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON DELETE RESTRICT,
  subgrupo_id UUID NOT NULL REFERENCES public.subgrupos(id) ON DELETE RESTRICT,
  unidade_venda TEXT NOT NULL,
  margem_padrao NUMERIC,
  preco_ultima_compra NUMERIC,
  vasilhame_ultima_compra_id UUID REFERENCES public.vasilhames(id) ON DELETE SET NULL,
  data_ultima_compra TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. COMPRAS
CREATE TABLE public.compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_compra INTEGER UNIQUE NOT NULL,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE RESTRICT,
  data_compra DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_compra TIME NOT NULL DEFAULT CURRENT_TIME,
  valor_produtos NUMERIC NOT NULL DEFAULT 0,
  valor_total NUMERIC NOT NULL DEFAULT 0,
  forma_pagamento TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. ITENS_COMPRA
CREATE TABLE public.itens_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id UUID NOT NULL REFERENCES public.compras(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  vasilhame_id UUID NOT NULL REFERENCES public.vasilhames(id) ON DELETE RESTRICT,
  quantidade_vasilhames NUMERIC NOT NULL,
  peso_total_kg NUMERIC NOT NULL,
  preco_por_vasilhame NUMERIC NOT NULL,
  preco_por_kg NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  margem_aplicada NUMERIC,
  preco_venda_sugerido NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ÍNDICES para otimização de consultas
CREATE INDEX idx_grupos_nome ON public.grupos(nome);
CREATE INDEX idx_grupos_codigo ON public.grupos(codigo);
CREATE INDEX idx_subgrupos_grupo_id ON public.subgrupos(grupo_id);
CREATE INDEX idx_subgrupos_nome ON public.subgrupos(nome);
CREATE INDEX idx_vasilhames_nome ON public.vasilhames(nome);
CREATE INDEX idx_fornecedores_razao_social ON public.fornecedores(razao_social);
CREATE INDEX idx_fornecedores_cnpj ON public.fornecedores(cnpj);
CREATE INDEX idx_produtos_codigo ON public.produtos(codigo);
CREATE INDEX idx_produtos_descricao ON public.produtos(descricao);
CREATE INDEX idx_produtos_grupo_id ON public.produtos(grupo_id);
CREATE INDEX idx_produtos_subgrupo_id ON public.produtos(subgrupo_id);
CREATE INDEX idx_compras_fornecedor_id ON public.compras(fornecedor_id);
CREATE INDEX idx_compras_data_compra ON public.compras(data_compra);
CREATE INDEX idx_compras_numero_compra ON public.compras(numero_compra);
CREATE INDEX idx_itens_compra_compra_id ON public.itens_compra(compra_id);
CREATE INDEX idx_itens_compra_produto_id ON public.itens_compra(produto_id);

-- TRIGGERS para updated_at
CREATE TRIGGER update_grupos_updated_at
  BEFORE UPDATE ON public.grupos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subgrupos_updated_at
  BEFORE UPDATE ON public.subgrupos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vasilhames_updated_at
  BEFORE UPDATE ON public.vasilhames
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- TRIGGER para gerar numero_compra sequencial
CREATE TRIGGER gerar_numero_compra_trigger
  BEFORE INSERT ON public.compras
  FOR EACH ROW
  EXECUTE FUNCTION public.gerar_numero_compra();

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subgrupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vasilhames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_compra ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (acesso completo por enquanto)
CREATE POLICY "Permitir acesso completo a grupos" ON public.grupos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a subgrupos" ON public.subgrupos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a vasilhames" ON public.vasilhames FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a fornecedores" ON public.fornecedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a produtos" ON public.produtos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a compras" ON public.compras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a itens_compra" ON public.itens_compra FOR ALL USING (true) WITH CHECK (true);
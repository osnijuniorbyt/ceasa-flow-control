-- Adicionar fornecedor padrão na tabela produtos
ALTER TABLE public.produtos 
ADD COLUMN IF NOT EXISTS fornecedor_padrao_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL;

-- Criar tabela de vínculo fornecedor-produto
CREATE TABLE IF NOT EXISTS public.fornecedor_produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  preco_habitual NUMERIC,
  ultima_compra TIMESTAMP WITH TIME ZONE,
  is_principal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(fornecedor_id, produto_id)
);

-- Habilitar RLS
ALTER TABLE public.fornecedor_produtos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para fornecedor_produtos
CREATE POLICY "Usuários autenticados podem ler fornecedor_produtos"
  ON public.fornecedor_produtos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar fornecedor_produtos"
  ON public.fornecedor_produtos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar fornecedor_produtos"
  ON public.fornecedor_produtos FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar fornecedor_produtos"
  ON public.fornecedor_produtos FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_fornecedor_produtos_updated_at
  BEFORE UPDATE ON public.fornecedor_produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela de listas de compras
CREATE TABLE IF NOT EXISTS public.listas_compras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  data_compra DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'pronta', 'em_execucao', 'finalizada')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.listas_compras ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para listas_compras
CREATE POLICY "Usuários autenticados podem ler listas_compras"
  ON public.listas_compras FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar listas_compras"
  ON public.listas_compras FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar listas_compras"
  ON public.listas_compras FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar listas_compras"
  ON public.listas_compras FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_listas_compras_updated_at
  BEFORE UPDATE ON public.listas_compras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela de itens da lista de compras
CREATE TABLE IF NOT EXISTS public.itens_lista_compras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lista_id UUID NOT NULL REFERENCES public.listas_compras(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  quantidade NUMERIC NOT NULL,
  fornecedor_sugerido_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  comprado BOOLEAN NOT NULL DEFAULT false,
  quantidade_real NUMERIC,
  valor_pago NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.itens_lista_compras ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para itens_lista_compras
CREATE POLICY "Usuários autenticados podem ler itens_lista_compras"
  ON public.itens_lista_compras FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar itens_lista_compras"
  ON public.itens_lista_compras FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar itens_lista_compras"
  ON public.itens_lista_compras FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar itens_lista_compras"
  ON public.itens_lista_compras FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_itens_lista_compras_updated_at
  BEFORE UPDATE ON public.itens_lista_compras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
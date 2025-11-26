-- Adicionar vasilhame secundário e campos de histórico ao produto
ALTER TABLE public.produtos
ADD COLUMN IF NOT EXISTS vasilhame_secundario_id UUID REFERENCES public.vasilhames(id),
ADD COLUMN IF NOT EXISTS preco_venda_atual NUMERIC,
ADD COLUMN IF NOT EXISTS data_ultima_venda TIMESTAMP WITH TIME ZONE;

-- Adicionar campo para controlar qual vasilhame foi usado na compra
ALTER TABLE public.itens_compra
ADD COLUMN IF NOT EXISTS vasilhame_usado TEXT DEFAULT 'padrao' CHECK (vasilhame_usado IN ('padrao', 'secundario'));
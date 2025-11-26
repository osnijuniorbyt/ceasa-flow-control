-- Adicionar coluna para vasilhame padrão na tabela produtos
ALTER TABLE public.produtos 
ADD COLUMN IF NOT EXISTS vasilhame_padrao_id uuid REFERENCES public.vasilhames(id);
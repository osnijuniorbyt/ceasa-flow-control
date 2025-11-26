-- Add user_id to all main tables for proper data isolation
-- This ensures each user only sees their own data

-- Add user_id to fornecedores
ALTER TABLE public.fornecedores 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to produtos
ALTER TABLE public.produtos 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to grupos
ALTER TABLE public.grupos 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to subgrupos
ALTER TABLE public.subgrupos 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to vasilhames
ALTER TABLE public.vasilhames 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to compras
ALTER TABLE public.compras 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to listas_compras
ALTER TABLE public.listas_compras 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set existing data to first user (preserve data)
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  SELECT id INTO first_user_id FROM auth.users ORDER BY created_at LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    UPDATE public.fornecedores SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.produtos SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.grupos SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.subgrupos SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.vasilhames SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.compras SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.listas_compras SET user_id = first_user_id WHERE user_id IS NULL;
  END IF;
END $$;

-- Make user_id NOT NULL after setting existing data
ALTER TABLE public.fornecedores ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.produtos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.grupos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.subgrupos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.vasilhames ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.compras ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.listas_compras ALTER COLUMN user_id SET NOT NULL;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to read all fornecedores" ON public.fornecedores;
DROP POLICY IF EXISTS "Allow authenticated users to insert fornecedores" ON public.fornecedores;
DROP POLICY IF EXISTS "Allow authenticated users to update fornecedores" ON public.fornecedores;
DROP POLICY IF EXISTS "Allow authenticated users to delete fornecedores" ON public.fornecedores;

DROP POLICY IF EXISTS "Allow authenticated users to read all produtos" ON public.produtos;
DROP POLICY IF EXISTS "Allow authenticated users to insert produtos" ON public.produtos;
DROP POLICY IF EXISTS "Allow authenticated users to update produtos" ON public.produtos;
DROP POLICY IF EXISTS "Allow authenticated users to delete produtos" ON public.produtos;

DROP POLICY IF EXISTS "Allow authenticated users to read all grupos" ON public.grupos;
DROP POLICY IF EXISTS "Allow authenticated users to insert grupos" ON public.grupos;
DROP POLICY IF EXISTS "Allow authenticated users to update grupos" ON public.grupos;
DROP POLICY IF EXISTS "Allow authenticated users to delete grupos" ON public.grupos;

DROP POLICY IF EXISTS "Allow authenticated users to read all subgrupos" ON public.subgrupos;
DROP POLICY IF EXISTS "Allow authenticated users to insert subgrupos" ON public.subgrupos;
DROP POLICY IF EXISTS "Allow authenticated users to update subgrupos" ON public.subgrupos;
DROP POLICY IF EXISTS "Allow authenticated users to delete subgrupos" ON public.subgrupos;

DROP POLICY IF EXISTS "Allow authenticated users to read all vasilhames" ON public.vasilhames;
DROP POLICY IF EXISTS "Allow authenticated users to insert vasilhames" ON public.vasilhames;
DROP POLICY IF EXISTS "Allow authenticated users to update vasilhames" ON public.vasilhames;
DROP POLICY IF EXISTS "Allow authenticated users to delete vasilhames" ON public.vasilhames;

DROP POLICY IF EXISTS "Allow authenticated users to read all compras" ON public.compras;
DROP POLICY IF EXISTS "Allow authenticated users to insert compras" ON public.compras;
DROP POLICY IF EXISTS "Allow authenticated users to update compras" ON public.compras;
DROP POLICY IF EXISTS "Allow authenticated users to delete compras" ON public.compras;

DROP POLICY IF EXISTS "Allow authenticated users to read all itens_compra" ON public.itens_compra;
DROP POLICY IF EXISTS "Allow authenticated users to insert itens_compra" ON public.itens_compra;
DROP POLICY IF EXISTS "Allow authenticated users to update itens_compra" ON public.itens_compra;
DROP POLICY IF EXISTS "Allow authenticated users to delete itens_compra" ON public.itens_compra;

DROP POLICY IF EXISTS "Allow authenticated users to read all listas_compras" ON public.listas_compras;
DROP POLICY IF EXISTS "Allow authenticated users to insert listas_compras" ON public.listas_compras;
DROP POLICY IF EXISTS "Allow authenticated users to update listas_compras" ON public.listas_compras;
DROP POLICY IF EXISTS "Allow authenticated users to delete listas_compras" ON public.listas_compras;

DROP POLICY IF EXISTS "Allow authenticated users to read all itens_lista_compras" ON public.itens_lista_compras;
DROP POLICY IF EXISTS "Allow authenticated users to insert itens_lista_compras" ON public.itens_lista_compras;
DROP POLICY IF EXISTS "Allow authenticated users to update itens_lista_compras" ON public.itens_lista_compras;
DROP POLICY IF EXISTS "Allow authenticated users to delete itens_lista_compras" ON public.itens_lista_compras;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create secure policies that restrict access to own data only

-- Fornecedores policies
CREATE POLICY "Users can view own fornecedores"
ON public.fornecedores FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fornecedores"
ON public.fornecedores FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fornecedores"
ON public.fornecedores FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fornecedores"
ON public.fornecedores FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Produtos policies
CREATE POLICY "Users can view own produtos"
ON public.produtos FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own produtos"
ON public.produtos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own produtos"
ON public.produtos FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own produtos"
ON public.produtos FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Grupos policies
CREATE POLICY "Users can view own grupos"
ON public.grupos FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grupos"
ON public.grupos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grupos"
ON public.grupos FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own grupos"
ON public.grupos FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Subgrupos policies
CREATE POLICY "Users can view own subgrupos"
ON public.subgrupos FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subgrupos"
ON public.subgrupos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subgrupos"
ON public.subgrupos FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subgrupos"
ON public.subgrupos FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Vasilhames policies
CREATE POLICY "Users can view own vasilhames"
ON public.vasilhames FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vasilhames"
ON public.vasilhames FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vasilhames"
ON public.vasilhames FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vasilhames"
ON public.vasilhames FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Compras policies
CREATE POLICY "Users can view own compras"
ON public.compras FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own compras"
ON public.compras FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own compras"
ON public.compras FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own compras"
ON public.compras FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Itens_compra policies (inherit from compras)
CREATE POLICY "Users can view own itens_compra"
ON public.itens_compra FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.compras
    WHERE compras.id = itens_compra.compra_id
    AND compras.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own itens_compra"
ON public.itens_compra FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.compras
    WHERE compras.id = itens_compra.compra_id
    AND compras.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own itens_compra"
ON public.itens_compra FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.compras
    WHERE compras.id = itens_compra.compra_id
    AND compras.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.compras
    WHERE compras.id = itens_compra.compra_id
    AND compras.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own itens_compra"
ON public.itens_compra FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.compras
    WHERE compras.id = itens_compra.compra_id
    AND compras.user_id = auth.uid()
  )
);

-- Listas_compras policies
CREATE POLICY "Users can view own listas_compras"
ON public.listas_compras FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own listas_compras"
ON public.listas_compras FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listas_compras"
ON public.listas_compras FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own listas_compras"
ON public.listas_compras FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Itens_lista_compras policies (inherit from listas_compras)
CREATE POLICY "Users can view own itens_lista_compras"
ON public.itens_lista_compras FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.listas_compras
    WHERE listas_compras.id = itens_lista_compras.lista_id
    AND listas_compras.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own itens_lista_compras"
ON public.itens_lista_compras FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.listas_compras
    WHERE listas_compras.id = itens_lista_compras.lista_id
    AND listas_compras.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own itens_lista_compras"
ON public.itens_lista_compras FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.listas_compras
    WHERE listas_compras.id = itens_lista_compras.lista_id
    AND listas_compras.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.listas_compras
    WHERE listas_compras.id = itens_lista_compras.lista_id
    AND listas_compras.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own itens_lista_compras"
ON public.itens_lista_compras FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.listas_compras
    WHERE listas_compras.id = itens_lista_compras.lista_id
    AND listas_compras.user_id = auth.uid()
  )
);

-- Fornecedor_produtos policies (inherit from both fornecedor and produto)
DROP POLICY IF EXISTS "Allow authenticated users to read all fornecedor_produtos" ON public.fornecedor_produtos;
DROP POLICY IF EXISTS "Allow authenticated users to insert fornecedor_produtos" ON public.fornecedor_produtos;
DROP POLICY IF EXISTS "Allow authenticated users to update fornecedor_produtos" ON public.fornecedor_produtos;
DROP POLICY IF EXISTS "Allow authenticated users to delete fornecedor_produtos" ON public.fornecedor_produtos;

CREATE POLICY "Users can view own fornecedor_produtos"
ON public.fornecedor_produtos FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.fornecedores
    WHERE fornecedores.id = fornecedor_produtos.fornecedor_id
    AND fornecedores.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.produtos
    WHERE produtos.id = fornecedor_produtos.produto_id
    AND produtos.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own fornecedor_produtos"
ON public.fornecedor_produtos FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.fornecedores
    WHERE fornecedores.id = fornecedor_produtos.fornecedor_id
    AND fornecedores.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.produtos
    WHERE produtos.id = fornecedor_produtos.produto_id
    AND produtos.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own fornecedor_produtos"
ON public.fornecedor_produtos FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.fornecedores
    WHERE fornecedores.id = fornecedor_produtos.fornecedor_id
    AND fornecedores.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.produtos
    WHERE produtos.id = fornecedor_produtos.produto_id
    AND produtos.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.fornecedores
    WHERE fornecedores.id = fornecedor_produtos.fornecedor_id
    AND fornecedores.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.produtos
    WHERE produtos.id = fornecedor_produtos.produto_id
    AND produtos.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own fornecedor_produtos"
ON public.fornecedor_produtos FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.fornecedores
    WHERE fornecedores.id = fornecedor_produtos.fornecedor_id
    AND fornecedores.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.produtos
    WHERE produtos.id = fornecedor_produtos.produto_id
    AND produtos.user_id = auth.uid()
  )
);

-- Profiles policies - restrict to own profile only
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create indexes for better performance with user_id filters
CREATE INDEX IF NOT EXISTS idx_fornecedores_user_id ON public.fornecedores(user_id);
CREATE INDEX IF NOT EXISTS idx_produtos_user_id ON public.produtos(user_id);
CREATE INDEX IF NOT EXISTS idx_grupos_user_id ON public.grupos(user_id);
CREATE INDEX IF NOT EXISTS idx_subgrupos_user_id ON public.subgrupos(user_id);
CREATE INDEX IF NOT EXISTS idx_vasilhames_user_id ON public.vasilhames(user_id);
CREATE INDEX IF NOT EXISTS idx_compras_user_id ON public.compras(user_id);
CREATE INDEX IF NOT EXISTS idx_listas_compras_user_id ON public.listas_compras(user_id);
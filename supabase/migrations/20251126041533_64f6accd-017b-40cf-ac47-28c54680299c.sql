-- Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Função para criar perfil automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atualizar RLS das tabelas existentes (remover políticas permissivas)

-- Fornecedores
DROP POLICY IF EXISTS "Permitir acesso completo a fornecedores" ON public.fornecedores;
CREATE POLICY "Usuários autenticados podem ler fornecedores"
  ON public.fornecedores FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar fornecedores"
  ON public.fornecedores FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar fornecedores"
  ON public.fornecedores FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar fornecedores"
  ON public.fornecedores FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Compras
DROP POLICY IF EXISTS "Permitir acesso completo a compras" ON public.compras;
CREATE POLICY "Usuários autenticados podem ler compras"
  ON public.compras FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar compras"
  ON public.compras FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar compras"
  ON public.compras FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar compras"
  ON public.compras FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Itens de Compra
DROP POLICY IF EXISTS "Permitir acesso completo a itens_compra" ON public.itens_compra;
CREATE POLICY "Usuários autenticados podem ler itens_compra"
  ON public.itens_compra FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar itens_compra"
  ON public.itens_compra FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar itens_compra"
  ON public.itens_compra FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar itens_compra"
  ON public.itens_compra FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Produtos
DROP POLICY IF EXISTS "Permitir acesso completo a produtos" ON public.produtos;
CREATE POLICY "Usuários autenticados podem ler produtos"
  ON public.produtos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar produtos"
  ON public.produtos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar produtos"
  ON public.produtos FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar produtos"
  ON public.produtos FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Grupos
DROP POLICY IF EXISTS "Permitir acesso completo a grupos" ON public.grupos;
CREATE POLICY "Usuários autenticados podem ler grupos"
  ON public.grupos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar grupos"
  ON public.grupos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar grupos"
  ON public.grupos FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar grupos"
  ON public.grupos FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Subgrupos
DROP POLICY IF EXISTS "Permitir acesso completo a subgrupos" ON public.subgrupos;
CREATE POLICY "Usuários autenticados podem ler subgrupos"
  ON public.subgrupos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar subgrupos"
  ON public.subgrupos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar subgrupos"
  ON public.subgrupos FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar subgrupos"
  ON public.subgrupos FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Vasilhames
DROP POLICY IF EXISTS "Permitir acesso completo a vasilhames" ON public.vasilhames;
CREATE POLICY "Usuários autenticados podem ler vasilhames"
  ON public.vasilhames FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar vasilhames"
  ON public.vasilhames FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar vasilhames"
  ON public.vasilhames FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar vasilhames"
  ON public.vasilhames FOR DELETE
  USING (auth.uid() IS NOT NULL);
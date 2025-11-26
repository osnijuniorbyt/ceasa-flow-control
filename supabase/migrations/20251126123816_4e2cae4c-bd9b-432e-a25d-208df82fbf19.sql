-- Adicionar DEFAULT para user_id na tabela fornecedores
ALTER TABLE fornecedores ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Remover políticas RLS duplicadas
DROP POLICY IF EXISTS "Users can insert own fornecedores" ON fornecedores;
DROP POLICY IF EXISTS "Usuários autenticados podem criar fornecedores" ON fornecedores;

-- Criar política RLS consolidada e clara para INSERT
CREATE POLICY "Authenticated users can insert fornecedores"
ON fornecedores
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id = auth.uid());

-- Verificar e consolidar outras políticas duplicadas
DROP POLICY IF EXISTS "Users can view own fornecedores" ON fornecedores;
DROP POLICY IF EXISTS "Usuários autenticados podem ler fornecedores" ON fornecedores;

CREATE POLICY "Users can view own fornecedores"
ON fornecedores
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own fornecedores" ON fornecedores;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar fornecedores" ON fornecedores;

CREATE POLICY "Users can update own fornecedores"
ON fornecedores
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own fornecedores" ON fornecedores;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar fornecedores" ON fornecedores;

CREATE POLICY "Users can delete own fornecedores"
ON fornecedores
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
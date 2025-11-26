-- Adicionar campos ao cadastro de fornecedores
ALTER TABLE fornecedores 
ADD COLUMN IF NOT EXISTS tipo TEXT CHECK (tipo IN ('PEDRA', 'LOJAS', 'OUTROS')),
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS box TEXT;

-- Atualizar fornecedores existentes para ter tipo padrão
UPDATE fornecedores 
SET tipo = 'OUTROS' 
WHERE tipo IS NULL;
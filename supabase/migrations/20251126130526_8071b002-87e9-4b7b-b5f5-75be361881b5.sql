-- Adicionar campo tipo_calculo na tabela vasilhames
ALTER TABLE vasilhames 
ADD COLUMN tipo_calculo text NOT NULL DEFAULT 'peso' CHECK (tipo_calculo IN ('peso', 'unidade'));

COMMENT ON COLUMN vasilhames.tipo_calculo IS 'Define se o cálculo é por peso (kg) ou unidade (un, cx, dz, etc)';

-- Atualizar vasilhames existentes com unidade_base diferente de 'kg' para tipo_calculo 'unidade'
UPDATE vasilhames 
SET tipo_calculo = 'unidade' 
WHERE LOWER(unidade_base) != 'kg';
-- Adicionar campo peso_embalagem na tabela vasilhames
ALTER TABLE vasilhames ADD COLUMN IF NOT EXISTS peso_embalagem_kg numeric DEFAULT 0 NOT NULL;

COMMENT ON COLUMN vasilhames.peso_kg IS 'Peso líquido do produto na embalagem (ex: 18kg de tomate)';
COMMENT ON COLUMN vasilhames.peso_embalagem_kg IS 'Peso da embalagem vazia (ex: 2kg da caixa)';
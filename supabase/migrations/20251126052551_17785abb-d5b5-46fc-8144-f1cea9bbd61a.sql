-- Criar trigger para gerar numero_compra automaticamente
CREATE OR REPLACE FUNCTION public.gerar_numero_compra_v2()
RETURNS TRIGGER AS $$
BEGIN
  -- Gerar número sequencial baseado no máximo atual
  SELECT COALESCE(MAX(numero_compra), 0) + 1 
  INTO NEW.numero_compra 
  FROM public.compras;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS gerar_numero_compra_trigger ON public.compras;

-- Criar novo trigger
CREATE TRIGGER gerar_numero_compra_trigger
  BEFORE INSERT ON public.compras
  FOR EACH ROW
  EXECUTE FUNCTION public.gerar_numero_compra_v2();

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { NumberKeyboard } from "./NumberKeyboard";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  allowDecimal?: boolean;
  min?: number;
  max?: number;
  className?: string;
  disabled?: boolean;
}

export function NumberInput({
  value,
  onChange,
  placeholder = "0",
  allowDecimal = true,
  min = 0,
  max = 9999,
  className,
  disabled = false
}: NumberInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState("");

  const handleOpenKeyboard = () => {
    if (!disabled) {
      // Inicializa o valor temporário com o valor atual formatado corretamente
      const stringValue = value > 0 ? value.toString().replace('.', ',') : "";
      setTempValue(stringValue);
      setIsOpen(true);
    }
  };

  const handleConfirm = () => {
    // Converte vírgula para ponto para parseFloat
    const normalizedValue = tempValue.replace(',', '.');
    const numValue = parseFloat(normalizedValue) || 0;
    const clampedValue = Math.max(min, Math.min(max, numValue));
    
    // Aplica a mudança
    onChange(clampedValue);
    
    // Fecha o diálogo
    setIsOpen(false);
  };

  const handleCancel = () => {
    // Fecha o diálogo sem aplicar mudanças
    setIsOpen(false);
  };

  // Formata o valor para exibição no input
  const displayValue = value === 0 ? "" : 
    allowDecimal ? 
      value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) :
      value.toString();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Input
          value={displayValue}
          placeholder={placeholder}
          onClick={handleOpenKeyboard}
          onFocus={handleOpenKeyboard}
          readOnly
          className={`text-center font-semibold cursor-pointer ${className}`}
          disabled={disabled}
        />
      </DialogTrigger>
      <DialogContent className="p-0 max-w-sm" aria-describedby="number-keyboard-description">
        <DialogTitle className="sr-only">Teclado Numérico</DialogTitle>
        <div id="number-keyboard-description" className="sr-only">
          Use o teclado numérico para inserir valores
        </div>
        <NumberKeyboard
          value={tempValue}
          onChange={setTempValue}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          allowDecimal={allowDecimal}
          min={min}
          max={max}
        />
      </DialogContent>
    </Dialog>
  );
}

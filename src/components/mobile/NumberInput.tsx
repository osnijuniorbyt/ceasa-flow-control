
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
      const stringValue = value > 0 ? value.toString().replace('.', ',') : "";
      setTempValue(stringValue);
      setIsOpen(true);
    }
  };

  const handleConfirm = useCallback(() => {
    const normalizedValue = tempValue.replace(',', '.');
    const numValue = parseFloat(normalizedValue) || 0;
    const clampedValue = Math.max(min, Math.min(max, numValue));
    
    onChange(clampedValue);
    setIsOpen(false);
  }, [tempValue, min, max, onChange]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const handleValueChange = useCallback((newValue: string) => {
    setTempValue(newValue);
  }, []);

  // Formata o valor para exibição no input
  const displayValue = value === 0 ? "" : 
    allowDecimal ? 
      value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) :
      value.toString();

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>
        <Input
          type="text"
          inputMode="none"
          readOnly
          value={displayValue}
          placeholder={placeholder}
          onClick={handleOpenKeyboard}
          className={`text-center font-semibold cursor-pointer select-none ${className}`}
          disabled={disabled}
          style={{ fontSize: '16px' }}
        />
      </DialogTrigger>
      <DialogContent 
        className="p-0 max-w-sm" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Teclado Numérico</DialogTitle>
        <DialogDescription className="sr-only">
          Use o teclado numérico para inserir valores. Pressione OK para confirmar ou Cancelar para descartar as alterações.
        </DialogDescription>
        <NumberKeyboard
          value={tempValue}
          onChange={handleValueChange}
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

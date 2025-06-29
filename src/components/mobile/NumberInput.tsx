
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
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
  label?: string;
  unit?: string;
}

export function NumberInput({
  value,
  onChange,
  placeholder = "0",
  allowDecimal = true,
  min = 0,
  max = 9999,
  className,
  disabled = false,
  label = "Digite o valor",
  unit = ""
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

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleValueChange = useCallback((newValue: string) => {
    setTempValue(newValue);
  }, []);

  // Format value for display in input
  const displayValue = value === 0 ? "" : 
    allowDecimal ? 
      value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) :
      value.toString();

  return (
    <>
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
      
      <NumberKeyboard
        isOpen={isOpen}
        onClose={handleClose}
        value={tempValue}
        onChange={handleValueChange}
        onConfirm={handleConfirm}
        label={label}
        unit={unit}
        allowDecimals={allowDecimal}
      />
    </>
  );
}

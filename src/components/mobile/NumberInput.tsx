
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
  const [tempValue, setTempValue] = useState(value.toString());

  const handleOpenKeyboard = () => {
    if (!disabled) {
      setTempValue(value.toString());
      setIsOpen(true);
    }
  };

  const handleConfirm = () => {
    const numValue = parseFloat(tempValue) || 0;
    const clampedValue = Math.max(min, Math.min(max, numValue));
    onChange(clampedValue);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempValue(value.toString());
    setIsOpen(false);
  };

  const displayValue = value === 0 ? "" : value.toString();

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
      <DialogContent className="p-0 max-w-sm">
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

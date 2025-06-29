
import { useState, useEffect } from "react";
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

  // Debug logging for dialog state changes
  useEffect(() => {
    console.log('Dialog state:', { isOpen, tempValue });
  }, [isOpen, tempValue]);

  // Debug logging to check for unnecessary re-renders
  useEffect(() => {
    console.log('NumberInput re-rendered with props:', { value, disabled });
  });

  const handleOpenKeyboard = () => {
    if (!disabled) {
      // Inicializa o valor temporário com o valor atual formatado corretamente
      const stringValue = value > 0 ? value.toString().replace('.', ',') : "";
      console.log('Opening keyboard with value:', stringValue);
      setTempValue(stringValue);
      setIsOpen(true);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.blur(); // Remove focus to prevent native keyboard
    handleOpenKeyboard();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Mouse down event triggered');
    handleOpenKeyboard();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Touch start event triggered');
    handleOpenKeyboard();
  };

  const handleConfirm = () => {
    console.log('Confirming value:', tempValue);
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
    console.log('Cancelling keyboard input');
    // Fecha o diálogo sem aplicar mudanças
    setIsOpen(false);
  };

  // Formata o valor para exibição no input
  const displayValue = value === 0 ? "" : 
    allowDecimal ? 
      value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) :
      value.toString();

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log('Dialog onOpenChange called with:', open);
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Input
          value={displayValue}
          placeholder={placeholder}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onFocus={handleFocus}
          readOnly
          inputMode="none"
          className={`text-center font-semibold cursor-pointer select-none ${className}`}
          disabled={disabled}
          style={{ fontSize: '16px' }}
        />
      </DialogTrigger>
      <DialogContent 
        className="p-0 max-w-sm" 
        aria-describedby="number-keyboard-description"
        onPointerDownOutside={(e) => {
          console.log('Pointer down outside detected');
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          console.log('Interact outside detected');
          e.preventDefault();
        }}
      >
        <DialogTitle className="sr-only">Teclado Numérico</DialogTitle>
        <div id="number-keyboard-description" className="sr-only">
          Use o teclado numérico para inserir valores
        </div>
        <NumberKeyboard
          value={tempValue}
          onChange={(newValue) => {
            console.log('Keyboard value changed to:', newValue);
            setTempValue(newValue);
          }}
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

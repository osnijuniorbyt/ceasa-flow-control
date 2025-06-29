
import { Button } from "@/components/ui/button";
import { Minus, Plus, Delete, Check, X } from "lucide-react";

interface NumberKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  allowDecimal?: boolean;
  min?: number;
  max?: number;
}

export function NumberKeyboard({
  value,
  onChange,
  onConfirm,
  onCancel,
  allowDecimal = true,
  min = 0,
  max = 9999
}: NumberKeyboardProps) {
  const handleNumberPress = (num: string) => {
    if (value === "0" && num !== ".") {
      onChange(num);
    } else if (value.length < 6) {
      onChange(value + num);
    }
  };

  const handleDecimalPress = () => {
    if (allowDecimal && !value.includes(".") && value !== "") {
      onChange(value + ".");
    }
  };

  const handleBackspace = () => {
    if (value.length > 0) {
      const newValue = value.slice(0, -1);
      onChange(newValue || "0");
    }
  };

  const handleClear = () => {
    onChange("0");
  };

  const handleIncrement = () => {
    const numValue = parseFloat(value) || 0;
    const increment = allowDecimal ? 0.5 : 1;
    const newValue = Math.min(numValue + increment, max);
    onChange(newValue.toString());
  };

  const handleDecrement = () => {
    const numValue = parseFloat(value) || 0;
    const decrement = allowDecimal ? 0.5 : 1;
    const newValue = Math.max(numValue - decrement, min);
    onChange(newValue.toString());
  };

  const numberButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg w-full max-w-sm mx-auto">
      {/* Display */}
      <div className="mb-3 p-3 bg-muted rounded-lg">
        <div className="text-xl font-bold text-center font-mono">
          {value || "0"}
        </div>
      </div>

      {/* Quick adjust buttons */}
      <div className="flex gap-2 mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          className="flex-1 h-10 text-sm"
        >
          <Minus className="h-3 w-3 mr-1" />
          {allowDecimal ? "0.5" : "1"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          className="flex-1 h-10 text-sm"
        >
          <Plus className="h-3 w-3 mr-1" />
          {allowDecimal ? "0.5" : "1"}
        </Button>
      </div>

      {/* Number grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {numberButtons.flat().map((num) => (
          <Button
            key={num}
            variant="outline"
            className="h-12 text-lg font-semibold touch-manipulation"
            onClick={() => handleNumberPress(num)}
          >
            {num}
          </Button>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Button
          variant="outline"
          className="h-12 text-base font-semibold"
          onClick={handleClear}
        >
          C
        </Button>
        <Button
          variant="outline"
          className="h-12 text-lg font-semibold"
          onClick={() => handleNumberPress("0")}
        >
          0
        </Button>
        {allowDecimal ? (
          <Button
            variant="outline"
            className="h-12 text-lg font-semibold"
            onClick={handleDecimalPress}
          >
            ,
          </Button>
        ) : (
          <Button
            variant="outline"
            className="h-12"
            onClick={handleBackspace}
          >
            <Delete className="h-4 w-4" />
          </Button>
        )}
      </div>

      {allowDecimal && (
        <div className="mb-3">
          <Button
            variant="outline"
            className="w-full h-10 text-sm"
            onClick={handleBackspace}
          >
            <Delete className="h-3 w-3 mr-1" />
            Apagar
          </Button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-12"
        >
          <X className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          className="flex-1 h-12"
        >
          <Check className="h-4 w-4 mr-1" />
          OK
        </Button>
      </div>
    </div>
  );
}

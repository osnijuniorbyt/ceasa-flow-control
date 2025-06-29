
import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NumberKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  label?: string;
  unit?: string;
  allowDecimals?: boolean;
}

export function NumberKeyboard({
  isOpen,
  onClose,
  value,
  onChange,
  onConfirm,
  label = 'Digite o valor',
  unit = '',
  allowDecimals = true
}: NumberKeyboardProps) {
  const lastActionTime = useRef(0);
  const DEBOUNCE_DELAY = 150; // milliseconds

  // Debounced action handler
  const handleAction = useCallback((action: () => void) => {
    const now = Date.now();
    if (now - lastActionTime.current < DEBOUNCE_DELAY) return;
    
    lastActionTime.current = now;
    action();
  }, []);

  const handleNumber = (num: string) => {
    handleAction(() => {
      onChange(value + num);
    });
  };

  const handleBackspace = () => {
    handleAction(() => {
      onChange(value.slice(0, -1));
    });
  };

  const handleClear = () => {
    handleAction(() => {
      onChange('');
    });
  };

  const handleDecimal = () => {
    handleAction(() => {
      if (!value.includes(',')) {
        onChange(value + ',');
      }
    });
  };

  const handleConfirmClick = () => {
    handleAction(() => {
      onConfirm();
    });
  };

  const handleCancelClick = () => {
    handleAction(() => {
      onClose();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-sm p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{label}</DialogTitle>
        
        <div className="p-4">
          {/* Display */}
          <div className="mb-4 text-center">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-2">
              {value || '0'} {unit}
            </p>
          </div>

          {/* Number Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                type="button"
                variant="outline"
                className="h-14 text-lg font-semibold"
                onClick={() => handleNumber(num.toString())}
              >
                {num}
              </Button>
            ))}
            
            {allowDecimals ? (
              <Button
                type="button"
                variant="outline"
                className="h-14 text-lg"
                onClick={handleDecimal}
              >
                ,
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-14 text-lg"
                onClick={handleClear}
              >
                C
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              className="h-14 text-lg font-semibold"
              onClick={() => handleNumber('0')}
            >
              0
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="h-14 text-lg"
              onClick={handleBackspace}
            >
              ←
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-12"
              onClick={handleCancelClick}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="default"
              className="h-12"
              onClick={handleConfirmClick}
            >
              OK
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sanitizeInput, validateNumber } from '@/utils/security';
import { cn } from '@/lib/utils';

interface SecureInputProps {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email';
  value: string | number;
  onChange: (value: string | number) => void;
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SecureInput({
  id,
  label,
  type,
  value,
  onChange,
  required = false,
  min = 0,
  max = 999999,
  maxLength = 100,
  placeholder,
  className,
  disabled = false
}: SecureInputProps) {
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setError('');

    try {
      if (type === 'number') {
        const numValue = parseFloat(inputValue);
        
        if (inputValue !== '' && !validateNumber(numValue, min, max)) {
          setError(`Valor deve estar entre ${min} e ${max}`);
          return;
        }
        
        onChange(inputValue === '' ? '' : numValue);
      } else {
        const sanitized = sanitizeInput(inputValue);
        
        if (sanitized.length > maxLength) {
          setError(`Máximo ${maxLength} caracteres`);
          return;
        }
        
        if (type === 'email' && sanitized && !isValidEmail(sanitized)) {
          setError('Email inválido');
          return;
        }
        
        onChange(sanitized);
      }
    } catch (err) {
      setError('Entrada inválida');
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={cn(error && 'border-destructive', className)}
        required={required}
        disabled={disabled}
        min={type === 'number' ? min : undefined}
        max={type === 'number' ? max : undefined}
        maxLength={type !== 'number' ? maxLength : undefined}
        autoComplete="off"
        spellCheck="false"
      />
      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}
    </div>
  );
}


import { toast } from "sonner";

export const validateNumber = (value: number, min: number, max: number): boolean => {
  if (isNaN(value) || value < min || value > max) {
    return false;
  }
  return true;
};

export const validatePricingRule = (newPrice: number, cost: number) => {
  const margin = ((newPrice - cost) / cost) * 100;
  
  if (margin < 10) {
    return {
      valid: false,
      message: "Margem muito baixa (< 10%)"
    };
  }
  
  if (margin > 200) {
    return {
      valid: false,
      message: "Margem muito alta (> 200%)"
    };
  }
  
  return {
    valid: true,
    message: "Margem adequada"
  };
};

export const logPriceChange = (productId: string, oldPrice: number, newPrice: number) => {
  console.log(`Price change logged: ${productId} from R$ ${oldPrice.toFixed(2)} to R$ ${newPrice.toFixed(2)}`);
};

export const handleSecureError = (error: any, context: string) => {
  console.error(`${context}:`, error);
  toast.error(`${context}: ${error.message || 'Erro desconhecido'}`);
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+="[^"]*"/gi, '');
};

export const formatSecureNumber = (value: number): string => {
  return value.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

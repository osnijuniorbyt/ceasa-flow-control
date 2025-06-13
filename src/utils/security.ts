import { toast } from "sonner";

// Input sanitization to prevent XSS
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>\"'&]/g, (match) => {
      const htmlEntities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return htmlEntities[match] || match;
    })
    .trim()
    .substring(0, 100); // Limit input length
};

// Validate numeric inputs with safe ranges
export const validateNumber = (value: number, min: number = 0, max: number = 999999): boolean => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return false;
  }
  return value >= min && value <= max;
};

// Secure number formatting
export const formatSecureNumber = (value: number): string => {
  if (!validateNumber(value)) return '0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(value)); // Use abs to prevent negative display issues
};

// Validate price vs cost business rule
export const validatePricingRule = (price: number, cost: number): { valid: boolean; message?: string } => {
  if (!validateNumber(price) || !validateNumber(cost)) {
    return { valid: false, message: 'Valores inválidos detectados' };
  }
  
  if (cost >= price) {
    return { valid: false, message: 'Custo deve ser menor que o preço de venda' };
  }
  
  const margin = ((price - cost) / price) * 100;
  if (margin < 5) {
    return { valid: false, message: 'Margem muito baixa (mínimo 5%)' };
  }
  
  return { valid: true };
};

// Rate limiting implementation
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number = 10;
  private readonly windowMs: number = 60000; // 1 minute

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      toast.error('Muitas tentativas. Aguarde um momento.');
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// Audit logging for price changes
export const logPriceChange = (productId: string, oldPrice: number, newPrice: number, userId: string = 'anonymous') => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    productId: sanitizeInput(productId),
    oldPrice: validateNumber(oldPrice) ? oldPrice : 0,
    newPrice: validateNumber(newPrice) ? newPrice : 0,
    userId: sanitizeInput(userId),
    action: 'PRICE_UPDATE'
  };
  
  // In production, this would go to a secure logging service
  console.log('[AUDIT]', JSON.stringify(logEntry));
  
  // Store in localStorage for now (in production, use secure backend)
  try {
    const existingLogs = JSON.parse(localStorage.getItem('priceAuditLogs') || '[]');
    existingLogs.push(logEntry);
    
    // Keep only last 100 entries to prevent storage bloat
    const trimmedLogs = existingLogs.slice(-100);
    localStorage.setItem('priceAuditLogs', JSON.stringify(trimmedLogs));
  } catch (error) {
    console.error('Failed to store audit log:', error);
  }
};

// Generate CSRF token
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validate CSRF token
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken || token.length !== 64 || storedToken.length !== 64) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
  }
  return result === 0;
};

// Safe error handling without exposing system details
export const handleSecureError = (error: unknown, userMessage: string = 'Ocorreu um erro inesperado') => {
  // Log full error for debugging (in production, send to secure logging service)
  console.error('[SECURE_ERROR]', {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined
  });
  
  // Show user-friendly message without system details
  toast.error(userMessage);
};

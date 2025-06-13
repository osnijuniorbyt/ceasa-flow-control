
import React, { useState, useEffect } from 'react';
import { generateCSRFToken, validateCSRFToken, rateLimiter, handleSecureError } from '@/utils/security';

interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (data: any, csrfToken: string) => Promise<void> | void;
  formId: string;
  className?: string;
}

export function SecureForm({ children, onSubmit, formId, className }: SecureFormProps) {
  const [csrfToken, setCSRFToken] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Generate CSRF token on component mount
    const token = generateCSRFToken();
    setCSRFToken(token);
    sessionStorage.setItem(`csrf_${formId}`, token);
  }, [formId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      // Rate limiting check
      if (!rateLimiter.isAllowed(`form_${formId}`)) {
        return;
      }

      // CSRF validation
      const storedToken = sessionStorage.getItem(`csrf_${formId}`);
      if (!storedToken || !validateCSRFToken(csrfToken, storedToken)) {
        handleSecureError(new Error('CSRF validation failed'), 'Sessão expirada. Recarregue a página.');
        return;
      }

      setIsSubmitting(true);

      const formData = new FormData(event.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());

      await onSubmit(data, csrfToken);

      // Generate new CSRF token after successful submission
      const newToken = generateCSRFToken();
      setCSRFToken(newToken);
      sessionStorage.setItem(`csrf_${formId}`, newToken);

    } catch (error) {
      handleSecureError(error, 'Erro ao processar formulário');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {children}
    </form>
  );
}

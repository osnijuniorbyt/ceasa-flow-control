
import { ReactNode } from "react";

interface SecureFormProps {
  onSubmit: (data: any, csrfToken: string) => void;
  formId: string;
  children: ReactNode;
}

export function SecureForm({ onSubmit, formId, children }: SecureFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    const csrfToken = "mock-csrf-token"; // In production, this would be a real CSRF token
    
    onSubmit(data, csrfToken);
  };

  return (
    <form id={formId} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers";
import { User, UserRole } from "@/types/user";
import { useToast } from "@/hooks/use-toast";

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const { createUser, updateUser, loading } = useUsers();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "CONFERENTE" as UserRole,
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (user) {
        // Update existing user
        await updateUser(user.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        });
        toast({
          title: "Usuário atualizado",
          description: "As informações do usuário foram atualizadas com sucesso.",
        });
      } else {
        // Create new user
        if (!formData.password) {
          toast({
            title: "Erro",
            description: "A senha é obrigatória para novos usuários.",
            variant: "destructive",
          });
          return;
        }
        
        await createUser({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
        });
        toast({
          title: "Usuário criado",
          description: "O novo usuário foi criado com sucesso.",
        });
      }
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o usuário.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Cargo</Label>
        <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GERÊNCIA">GERÊNCIA</SelectItem>
            <SelectItem value="COMERCIAL">COMERCIAL</SelectItem>
            <SelectItem value="COMPRADOR">COMPRADOR</SelectItem>
            <SelectItem value="CONFERENTE">CONFERENTE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!user && (
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : user ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}

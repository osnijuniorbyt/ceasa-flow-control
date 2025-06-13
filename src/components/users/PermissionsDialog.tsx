
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle } from "lucide-react";
import { User } from "@/types/user";
import { getUserPermissions } from "@/utils/permissions";

interface PermissionsDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PermissionsDialog({ user, open, onOpenChange }: PermissionsDialogProps) {
  const permissions = getUserPermissions(user.role);
  
  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  const getModuleTitle = (module: string) => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      purchase_orders: 'Pedidos de Compra',
      buyer_portal: 'Portal do Comprador',
      warehouse: 'Depósito',
      inventory: 'Inventário',
      commercial: 'Central Comercial',
      deliveries: 'Entregas',
      reports: 'Relatórios',
      users: 'Usuários',
      settings: 'Configurações',
    };
    return titles[module] || module;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissões do Usuário: {user.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {user.role}
            </Badge>
            <span className="text-muted-foreground">
              {permissions.length} permissões ativas
            </span>
          </div>

          <div className="grid gap-4">
            {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
              <Card key={module}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {getModuleTitle(module)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {modulePermissions.map((permission) => (
                      <div
                        key={`${permission.module}-${permission.action}`}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{permission.description}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {permissions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Este usuário não possui permissões atribuídas.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

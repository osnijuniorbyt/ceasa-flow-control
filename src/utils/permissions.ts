
import { Permission, RolePermissions, UserRole } from '@/types/user';

export const ALL_PERMISSIONS: Permission[] = [
  // Dashboard
  { module: 'dashboard', action: 'view', description: 'Ver dashboard' },
  { module: 'dashboard', action: 'view_analytics', description: 'Ver análises avançadas' },
  
  // Purchase Orders
  { module: 'purchase_orders', action: 'view', description: 'Ver pedidos de compra' },
  { module: 'purchase_orders', action: 'create', description: 'Criar pedidos de compra' },
  { module: 'purchase_orders', action: 'edit', description: 'Editar pedidos de compra' },
  { module: 'purchase_orders', action: 'delete', description: 'Excluir pedidos de compra' },
  { module: 'purchase_orders', action: 'approve', description: 'Aprovar pedidos de compra' },
  
  // Buyer Portal
  { module: 'buyer_portal', action: 'view', description: 'Acessar portal do comprador' },
  { module: 'buyer_portal', action: 'manage', description: 'Gerenciar portal do comprador' },
  
  // Warehouse
  { module: 'warehouse', action: 'view', description: 'Ver depósito' },
  { module: 'warehouse', action: 'receiving', description: 'Conferir recebimentos' },
  { module: 'warehouse', action: 'manage', description: 'Gerenciar depósito' },
  
  // Inventory
  { module: 'inventory', action: 'view', description: 'Ver inventário' },
  { module: 'inventory', action: 'view_prices', description: 'Ver preços' },
  { module: 'inventory', action: 'edit', description: 'Editar inventário' },
  { module: 'inventory', action: 'adjust', description: 'Ajustar estoque' },
  
  // Commercial
  { module: 'commercial', action: 'view', description: 'Ver central comercial' },
  { module: 'commercial', action: 'ai_insights', description: 'Ver insights de IA' },
  { module: 'commercial', action: 'pricing', description: 'Definir preços' },
  
  // Deliveries
  { module: 'deliveries', action: 'view', description: 'Ver entregas' },
  { module: 'deliveries', action: 'manage', description: 'Gerenciar entregas' },
  
  // Reports
  { module: 'reports', action: 'view', description: 'Ver relatórios' },
  { module: 'reports', action: 'advanced', description: 'Relatórios avançados' },
  { module: 'reports', action: 'export', description: 'Exportar relatórios' },
  
  // Users & Settings
  { module: 'users', action: 'view', description: 'Ver usuários' },
  { module: 'users', action: 'create', description: 'Criar usuários' },
  { module: 'users', action: 'edit', description: 'Editar usuários' },
  { module: 'users', action: 'delete', description: 'Excluir usuários' },
  { module: 'settings', action: 'view', description: 'Ver configurações' },
  { module: 'settings', action: 'edit', description: 'Editar configurações' },
];

export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'GERÊNCIA',
    permissions: ALL_PERMISSIONS, // Gerência tem acesso completo
  },
  {
    role: 'COMERCIAL',
    permissions: ALL_PERMISSIONS.filter(p => 
      p.module !== 'users' && 
      !(p.module === 'settings' && p.action === 'edit') &&
      p.module !== 'warehouse'
    ),
  },
  {
    role: 'COMPRADOR',
    permissions: ALL_PERMISSIONS.filter(p => 
      ['dashboard', 'purchase_orders', 'buyer_portal', 'inventory', 'reports'].includes(p.module) &&
      !['delete', 'approve', 'advanced'].includes(p.action)
    ),
  },
  {
    role: 'CONFERENTE',
    permissions: ALL_PERMISSIONS.filter(p => 
      ['dashboard', 'warehouse', 'inventory'].includes(p.module) &&
      !['view_prices', 'edit', 'adjust', 'manage'].includes(p.action)
    ),
  },
];

export function getUserPermissions(role: UserRole): Permission[] {
  const rolePermissions = ROLE_PERMISSIONS.find(rp => rp.role === role);
  return rolePermissions?.permissions || [];
}

export function hasPermission(role: UserRole, module: string, action: string): boolean {
  const permissions = getUserPermissions(role);
  return permissions.some(p => p.module === module && p.action === action);
}

export function canAccessModule(role: UserRole, module: string): boolean {
  const permissions = getUserPermissions(role);
  return permissions.some(p => p.module === module);
}

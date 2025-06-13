
export type UserRole = 'GERÊNCIA' | 'COMERCIAL' | 'COMPRADOR' | 'CONFERENTE';

export interface Permission {
  module: string;
  action: string;
  description: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  createdBy: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  timestamp: Date;
  ipAddress?: string;
}

export interface UserCreateData {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

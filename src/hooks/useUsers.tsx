
import { useState, useEffect } from 'react';
import { User, UserCreateData, UserUpdateData, ActivityLog } from '@/types/user';

// Mock data - In a real app, this would come from an API/database
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Administrador CEASA',
    email: 'admin@ceasa.com',
    role: 'GERÊNCIA',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
    createdBy: 'system'
  },
  {
    id: '2',
    name: 'Maria Silva',
    email: 'maria.silva@ceasa.com',
    role: 'COMERCIAL',
    isActive: true,
    createdAt: new Date('2024-02-15'),
    lastLogin: new Date('2024-06-10'),
    createdBy: '1'
  },
  {
    id: '3',
    name: 'João Santos',
    email: 'joao.santos@ceasa.com',
    role: 'COMPRADOR',
    isActive: true,
    createdAt: new Date('2024-03-01'),
    lastLogin: new Date('2024-06-12'),
    createdBy: '1'
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@ceasa.com',
    role: 'CONFERENTE',
    isActive: false,
    createdAt: new Date('2024-04-10'),
    createdBy: '1'
  }
];

const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Administrador CEASA',
    action: 'create_user',
    module: 'users',
    details: 'Criou usuário Maria Silva',
    timestamp: new Date('2024-02-15T10:30:00'),
  },
  {
    id: '2',
    userId: '2',
    userName: 'Maria Silva',
    action: 'view_reports',
    module: 'reports',
    details: 'Visualizou relatório de vendas',
    timestamp: new Date('2024-06-10T14:15:00'),
  },
  {
    id: '3',
    userId: '3',
    userName: 'João Santos',
    action: 'create_purchase_order',
    module: 'purchase_orders',
    details: 'Criou pedido de compra #PO-2024-001',
    timestamp: new Date('2024-06-12T09:45:00'),
  },
];

export function useUsers() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(false);

  const createUser = async (userData: UserCreateData): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        ...userData,
        isActive: true,
        createdAt: new Date(),
        createdBy: '1', // Would come from auth context
      };
      
      setUsers(prev => [...prev, newUser]);
      
      // Log activity
      logActivity('1', 'Administrador CEASA', 'create_user', 'users', `Criou usuário ${userData.name}`);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, updates: UserUpdateData): Promise<void> => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...updates } : user
      ));
      
      const user = users.find(u => u.id === id);
      if (user) {
        logActivity('1', 'Administrador CEASA', 'update_user', 'users', `Atualizou usuário ${user.name}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = users.find(u => u.id === id);
      setUsers(prev => prev.filter(u => u.id !== id));
      
      if (user) {
        logActivity('1', 'Administrador CEASA', 'delete_user', 'users', `Excluiu usuário ${user.name}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
  };
}

export function useActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (filters?: { userId?: string; module?: string; startDate?: Date; endDate?: Date }) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredLogs = [...mockActivityLogs];
      
      if (filters?.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      
      if (filters?.module) {
        filteredLogs = filteredLogs.filter(log => log.module === filters.module);
      }
      
      if (filters?.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
      }
      
      if (filters?.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
      }
      
      setLogs(filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    } finally {
      setLoading(false);
    }
  };

  return {
    logs,
    loading,
    fetchLogs,
  };
}

function logActivity(userId: string, userName: string, action: string, module: string, details: string) {
  const newLog: ActivityLog = {
    id: Date.now().toString(),
    userId,
    userName,
    action,
    module,
    details,
    timestamp: new Date(),
  };
  
  // In a real app, this would be sent to the backend
  console.log('Activity logged:', newLog);
}

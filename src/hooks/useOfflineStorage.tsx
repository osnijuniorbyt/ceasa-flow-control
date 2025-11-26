import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface OfflineData {
  timestamp: number;
  data: any;
}

export function useOfflineStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item);
      // Check if it's wrapped in OfflineData structure
      if (parsed && typeof parsed === 'object' && 'data' in parsed) {
        return parsed.data ?? initialValue;
      }
      return parsed ?? initialValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return initialValue;
    }
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('✅ Conexão restaurada!');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('⚠️ Sem conexão - dados salvos localmente');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      const dataToSave: OfflineData = {
        timestamp: Date.now(),
        data: value
      };
      localStorage.setItem(key, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      toast.error('Erro ao salvar dados localmente');
    }
  }, [key, value]);

  return { value, setValue, isOnline };
}

export function getOfflineData<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const offlineData: OfflineData = JSON.parse(item);
    return offlineData.data;
  } catch (error) {
    console.error('Error getting offline data:', error);
    return null;
  }
}

export function clearOfflineData(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing offline data:', error);
  }
}

export function syncOfflineData<T>(
  key: string, 
  syncFn: (data: T) => Promise<void>
): Promise<void> {
  return new Promise((resolve, reject) => {
    const data = getOfflineData<T>(key);
    
    if (!data) {
      resolve();
      return;
    }

    syncFn(data)
      .then(() => {
        clearOfflineData(key);
        toast.success('Dados sincronizados!');
        resolve();
      })
      .catch((error) => {
        toast.error('Erro ao sincronizar dados');
        reject(error);
      });
  });
}
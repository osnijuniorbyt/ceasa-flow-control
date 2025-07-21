import { useEffect, useState } from 'react';

// Custom hook to handle real-time updates for purchase-related data
export function usePurchaseUpdates() {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Function to trigger a refresh of purchase data
  const triggerUpdate = () => {
    setLastUpdate(Date.now());
  };

  // Listen for storage changes (for cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('purchase_orders') || e.key?.includes('products')) {
        triggerUpdate();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    lastUpdate,
    triggerUpdate
  };
}
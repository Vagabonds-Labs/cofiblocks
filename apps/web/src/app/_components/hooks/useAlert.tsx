import { useState } from 'react';

function useAlerts() {
  const [alerts, setAlerts] = useState<Array<{ id: number; type: 'success' | 'error' | 'info'; message: string; description: string }>>([]);

  const addAlert = (alert: { type: 'success' | 'error' | 'info'; message: string; description: string }) => {
    setAlerts((prev) => [...prev, { id: Date.now(), ...alert }]);
  };

  const removeAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return { alerts, addAlert, removeAlert };
}

export default useAlerts;

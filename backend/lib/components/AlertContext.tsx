'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

export type AlertType = 'success' | 'error';

type AlertItem = {
  id: string;
  type: AlertType;
  message: string;
};

type AlertContextType = {
  notify: (type: AlertType, message: string) => void;
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const notify = (type: AlertType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setAlerts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((item) => item.id !== id));
    }, 3000);
  };

  const value = useMemo(
    () => ({
      notify,
      notifySuccess: (message: string) => notify('success', message),
      notifyError: (message: string) => notify('error', message)
    }),
    []
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-xl px-4 py-3 text-sm shadow-lg ${
              alert.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            {alert.message}
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
}
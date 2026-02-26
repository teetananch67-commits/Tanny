'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export type User = {
  id: number;
  email: string;
  role: string;
  name: string;
  phone?: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  showAuth: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  refresh: () => Promise<void>;
  setUser: (user: User | null) => void;
  requireAuth: () => boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const refresh = async () => {
    try {
      const data = await apiFetch<User>('/api/me');
      setUser(data);
    } catch {
      try {
        await apiFetch('/api/auth/refresh', { method: 'POST' });
        const data = await apiFetch<User>('/api/me');
        setUser(data);
      } catch {
        setUser((prev) => prev ?? null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openAuth = () => setShowAuth(true);
  const closeAuth = () => setShowAuth(false);

  const requireAuth = () => {
    if (user) return true;
    setShowAuth(true);
    return false;
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, showAuth, openAuth, closeAuth, refresh, setUser, requireAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

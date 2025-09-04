// contexts/UserContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/lib/auth-service';

import { UserInfo } from "@/types/user"

interface UserContextType {
  userr: UserInfo | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [userr, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const userInfo = await AuthService.getCurrentUser();
      setUser(userInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setError(null);
      // Redirigir al login
      window.location.href = '/select-tenant';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error during logout');
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const contextValue: UserContextType = {
    userr,
    loading,
    error,
    refreshUser,
    logout,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
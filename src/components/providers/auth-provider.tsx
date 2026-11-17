'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'HOSPITAL' | 'ADMIN';
  displayName: string;
  walletAddress?: string;
  publicKey?: string;
  profile?: any;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  switchDemoUser: (role: 'PATIENT' | 'DOCTOR' | 'HOSPITAL' | 'ADMIN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  switchDemoUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    const savedToken = localStorage.getItem('medchain_token');
    const savedUser = localStorage.getItem('medchain_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('medchain_token');
        localStorage.removeItem('medchain_user');
      }
    } else {
      // Auto-load Demo Patient by default for seamless demonstration
      switchDemoUser('PATIENT');
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('medchain_token', newToken);
    localStorage.setItem('medchain_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('medchain_token');
    localStorage.removeItem('medchain_user');
  };

  const switchDemoUser = async (role: 'PATIENT' | 'DOCTOR' | 'HOSPITAL' | 'ADMIN') => {
    const demoCredentials: Record<string, { email: string }> = {
      PATIENT: { email: 'patient@medchain.demo' },
      DOCTOR: { email: 'doctor@medchain.demo' },
      HOSPITAL: { email: 'hospital@medchain.demo' },
      ADMIN: { email: 'admin@medchain.demo' },
    };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demoCredentials[role].email,
          password: 'Demo@123',
        }),
      });

      const json = await res.json();
      if (json.success) {
        login(json.data.token, json.data.user);
      }
    } catch (err) {
      console.error('Failed to switch demo user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

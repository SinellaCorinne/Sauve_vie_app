import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { authRoutes } from '../config/api';

export type UserRole = 'donor' | 'hospital';

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  blood_type?: string;
  city?: string;
  phone?: string;
  is_available?: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (token: string, user: User) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        const storedUser = await AsyncStorage.getItem('auth_user');

        console.log('Auth bootstrap: storedToken?', !!storedToken);
        console.log('Auth bootstrap: storedUser?', !!storedUser);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          console.log('Auth bootstrap: fetching /auth/me');
          const response = await api.get(authRoutes.me);
          console.log('Auth bootstrap: /auth/me response', response.data);
          const currentUser = response.data as User;
          setUser(currentUser);
          await AsyncStorage.setItem('auth_user', JSON.stringify(currentUser));
        }
      } catch (error) {
        console.log('Auth bootstrap error:', error);
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('auth_user');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const setSession = async (nextToken: string, nextUser: User) => {
    console.log('Auth setSession: storing token and user', { nextToken: !!nextToken, nextUser });
    setToken(nextToken);
    setUser(nextUser);
    await AsyncStorage.setItem('auth_token', nextToken);
    await AsyncStorage.setItem('auth_user', JSON.stringify(nextUser));
  };

  const signIn = async (email: string, password: string) => {
    console.log('Auth signIn: start', { email, password: '***' });
    try {
      const response = await api.post(authRoutes.login, { email, password });
      console.log('Auth signIn: success', response.data);
      const nextToken = response.data.token as string;
      const nextUser = response.data.user as User;
      await setSession(nextToken, nextUser);
    } catch (error) {
      console.log('Auth signIn: error', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Auth signOut: calling /auth/logout');
      await api.post('/auth/logout');
      console.log('Auth signOut: logout success');
    } catch (error) {
      console.log('Auth signOut: error ignored', error);
    }

    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
  };

  const value = useMemo<AuthContextType>(
    () => ({ user, token, loading, signIn, signOut, setSession }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// 前言：此檔案定義了前端的認證上下文提供者 (AuthProvider)。
// 它負責管理用戶的認證狀態，包括登入、登出、註冊，並將認證資訊提供給應用程式中的其他組件。
// 認證邏輯已從 Supabase Auth 遷移到自建的 JWT API。

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login, register, refreshAccessToken } from '../api/auth';
import { setAuthToken, getAuthToken, removeAuthToken } from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken();
      if (token) {
        // 嘗試刷新 token 以驗證其有效性
        try {
          const { accessToken, user: userData } = await refreshAccessToken(token);
          setAuthToken(accessToken);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to refresh token:', error);
          removeAuthToken();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const handleLogin = async (credentials: any) => {
    setLoading(true);
    try {
      const { accessToken, user: userData } = await login(credentials);
      setAuthToken(accessToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      removeAuthToken();
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData: any) => {
    setLoading(true);
    try {
      const { accessToken, user: registeredUser } = await register(userData);
      setAuthToken(accessToken);
      setUser(registeredUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration failed:', error);
      removeAuthToken();
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login: handleLogin, register: handleRegister, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

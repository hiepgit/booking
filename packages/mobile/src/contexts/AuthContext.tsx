import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { clearTokens } from '../lib/apiClient';

// Types
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
}

export interface AuthContextType {
  // State
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  
  // Actions
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  const checkAuthenticationStatus = async (): Promise<void> => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      
      if (accessToken) {
        // TODO: Validate token with backend and get user info
        // For now, just set authenticated if token exists
        setIsAuthenticated(true);
        console.log('✅ User already authenticated');
      } else {
        console.log('❌ No stored token found');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: AuthUser): void => {
    setIsAuthenticated(true);
    setUser(userData);
    console.log('✅ User logged in:', userData.email);
  };

  const logout = async (): Promise<void> => {
    try {
      await clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      console.log('✅ User logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  };

  const updateUser = (userData: Partial<AuthUser>): void => {
    if (user) {
      setUser({ ...user, ...userData });
      console.log('✅ User updated');
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

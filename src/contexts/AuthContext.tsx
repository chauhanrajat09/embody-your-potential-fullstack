import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getUserFromStorage, saveUserToStorage } from '@/lib/api';

interface DiscordProfile {
  id: string;
  username: string;
  avatar?: string;
  email?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  token: string;
  discord?: DiscordProfile | null;
  authProvider?: 'local' | 'discord';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Checking for existing user...');
        const userInfo = getUserFromStorage();
        console.log('User from storage:', userInfo);
        if (userInfo) {
          setUser(userInfo);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        localStorage.removeItem('userInfo');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting login...');
      const userData = await authAPI.login(email, password);
      console.log('Login successful, user data:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting registration...');
      const userData = await authAPI.register(name, email, password);
      console.log('Registration successful, user data:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Registration error in context:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  // Computed property for authenticated state
  const isAuthenticated = !!user?.token;

  const contextValue = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated
  };

  console.log('Auth context value:', { user: !!user, loading, isAuthenticated });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 
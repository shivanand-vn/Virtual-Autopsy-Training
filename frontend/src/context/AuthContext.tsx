import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, getAuthToken, setAuthToken, clearAuthToken, getStoredUser, setStoredUser } from '../lib/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'STUDENT' | 'PENDING_APPROVAL';
  avatar?: string;
  title?: string;
  organization?: string;
  isTemporaryPassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAdmin = user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';

  const checkIsTempPassword = (userEmail: string, isTempProp?: boolean): boolean => {
    if (isTempProp) return true;
    if (!userEmail) return false;
    const cleanEmail = userEmail.trim().toLowerCase();
    return localStorage.getItem(`vat_temp_pwd_${cleanEmail}`) === 'true';
  };

  const refreshUser = async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        const fetchedUser = res.data.user;
        const isTemp = checkIsTempPassword(fetchedUser.email, fetchedUser.isTemporaryPassword);
        const updatedUser: User = {
          ...fetchedUser,
          isTemporaryPassword: isTemp,
        };
        setUser(updatedUser);
        setStoredUser(updatedUser);
      }
    } catch {
      clearAuthToken();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vat_auth_token' && !e.newValue) {
        setUser(null);
        setToken(null);
      }
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    const { user: loggedInUser, token: authToken } = res.data;

    const isTemp = checkIsTempPassword(loggedInUser?.email || email, loggedInUser?.isTemporaryPassword);
    const updatedUser: User = {
      ...loggedInUser,
      isTemporaryPassword: isTemp,
    };

    setUser(updatedUser);
    setToken(authToken);
    setAuthToken(authToken);
    setStoredUser(updatedUser);

    return updatedUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      clearAuthToken();
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isStudent,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

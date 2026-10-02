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
  updateUser: (updatedFields: Partial<User>) => void;
  uploadAvatar: (file: File) => Promise<string>;
  removeAvatar: () => Promise<void>;
  updateProfile: (profileData: { fullName?: string; organization?: string; title?: string }) => Promise<User>;
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
    } catch (err: any) {
      // Only clear credentials if backend explicitly rejected with 401 or 403
      if (err?.status === 401 || err?.status === 403) {
        clearAuthToken();
        setUser(null);
        setToken(null);
      } else {
        console.warn('Could not verify session with /auth/me, keeping local session:', err?.message || err);
      }
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

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedFields };
      setStoredUser(merged);
      return merged;
    });
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await api.upload('/auth/avatar', formData);
    const { user: updatedUser, avatarUrl } = res.data;

    setUser(updatedUser);
    setStoredUser(updatedUser);
    return avatarUrl;
  };

  const removeAvatar = async (): Promise<void> => {
    const res = await api.delete('/auth/avatar');
    const { user: updatedUser } = res.data;

    setUser(updatedUser);
    setStoredUser(updatedUser);
  };

  const updateProfile = async (profileData: {
    fullName?: string;
    organization?: string;
    title?: string;
  }): Promise<User> => {
    const res = await api.put('/auth/profile', profileData);
    const { user: updatedUser } = res.data;

    setUser(updatedUser);
    setStoredUser(updatedUser);
    return updatedUser;
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
        updateUser,
        uploadAvatar,
        removeAvatar,
        updateProfile,
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

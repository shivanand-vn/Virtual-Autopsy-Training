import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, getAuthToken, setAuthToken, clearAuthToken, getStoredUser, setStoredUser } from '../lib/api';
import { VatAnimatedLogo, VatLogoMode } from '../components/common/VatAnimatedLogo';

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

export interface AuthOverlayState {
  show: boolean;
  mode?: VatLogoMode;
  title?: string;
  subtitle?: string;
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
  authOverlay: AuthOverlayState | null;
  setAuthOverlay: React.Dispatch<React.SetStateAction<AuthOverlayState | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialUser = getStoredUser();
  const initialToken = getAuthToken();
  const [user, setUser] = useState<User | null>(initialUser);
  const [token, setToken] = useState<string | null>(initialToken);
  // If valid credentials already exist in localStorage, do not block the UI with full-screen spinner
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser && !!initialToken);
  const [authOverlay, setAuthOverlay] = useState<AuthOverlayState | null>(null);

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
    setAuthOverlay({
      show: true,
      mode: 'scanner',
      title: 'Verifying user...',
    });
    const startTime = Date.now();
    try {
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
      window.dispatchEvent(new Event('auth-login'));

      const elapsed = Date.now() - startTime;
      if (elapsed < 650) {
        await new Promise((r) => setTimeout(r, 650 - elapsed));
      }

      return updatedUser;
    } finally {
      setTimeout(() => {
        setAuthOverlay(null);
      }, 200);
    }
  };

  const logout = async () => {
    setAuthOverlay({
      show: true,
      mode: 'orbit',
      title: 'Signing out...',
    });
    const startTime = Date.now();
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      clearAuthToken();
      setUser(null);
      setToken(null);

      const elapsed = Date.now() - startTime;
      if (elapsed < 600) {
        await new Promise((r) => setTimeout(r, 600 - elapsed));
      }

      setTimeout(() => {
        setAuthOverlay(null);
      }, 200);
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
        authOverlay,
        setAuthOverlay,
      }}
    >
      {/* Global Session & Action Overlay */}
      {authOverlay?.show && (
        <div className="fixed inset-0 z-[9999] bg-[#050c17]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <VatAnimatedLogo
            mode={authOverlay.mode || 'scanner'}
            size="lg"
            showLabel={true}
            labelTitle={authOverlay.title}
            labelSubtitle={authOverlay.subtitle}
            priority={true}
          />
        </div>
      )}

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

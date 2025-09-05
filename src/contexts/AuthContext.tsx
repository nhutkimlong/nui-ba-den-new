import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  birthday?: string;
  cccd?: string;
  address?: string;
  // avatar removed
  climbCount?: number;
  lastClimbAt?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (username: string, password: string) => Promise<{ success: boolean; role?: string }>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  updateProfile: (fields: Partial<UserProfile>) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi component mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('adminToken');
    const loginTime = localStorage.getItem('adminLoginTime');
    const userJson = localStorage.getItem('userProfile');
    
    if (token && loginTime) {
      const loginTimestamp = parseInt(loginTime);
      const currentTime = Date.now();
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 giờ
      
      if (currentTime - loginTimestamp < sessionDuration) {
        setIsAuthenticated(true);
        if (userJson) {
          try {
            const parsed = JSON.parse(userJson);
            setUser(parsed);
          } catch {}
        } else {
          // Fetch profile from backend if local is missing and token exists
          try {
            const res = await authApi.verifyToken(token);
            if (res.success && (res.data as any)?.valid && (res.data as any)?.email) {
              const profileRes = await authApi.getProfileByEmail((res.data as any).email);
              if (profileRes.success && (profileRes.data as any)?.user) {
                localStorage.setItem('userProfile', JSON.stringify((profileRes.data as any).user));
                setUser((profileRes.data as any).user);
              }
            }
          } catch {}
        }
      } else {
        // Session hết hạn
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminLoginTime');
        localStorage.removeItem('userProfile');
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    
    setIsLoading(false);
  };

  const login = async (usernameOrEmail: string, password: string): Promise<{ success: boolean; role?: string }> => {
    try {
      setIsLoading(true);
      const res = await authApi.login({ email: usernameOrEmail, password });
      if (!res.success || !res.data) {
        setIsAuthenticated(false);
        setUser(null);
        return { success: false };
      }
      const { token, user: u } = res.data as any;
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminLoginTime', Date.now().toString());
      if (u) {
        const profile: UserProfile = { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone, birthday: u.birthday, cccd: u.cccd, address: u.address, climbCount: u.climbCount, lastClimbAt: u.lastClimbAt };
        localStorage.setItem('userProfile', JSON.stringify(profile));
        setUser(profile);
      }
      setIsAuthenticated(true);
      return { success: true, role: (res.data as any)?.user?.role || u?.role };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await authApi.register({ name, email, password });
      if (!res.success || !res.data) return false;
      const { token, user: u } = res.data as any;
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminLoginTime', Date.now().toString());
      const profile: UserProfile = { id: u.id, name: u.name, email: u.email, role: u.role };
      localStorage.setItem('userProfile', JSON.stringify(profile));
      setIsAuthenticated(true);
      setUser(profile);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('userProfile');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    register,
    updateProfile: async (fields: Partial<UserProfile>) => {
      if (!user) return false;
      try {
        setIsLoading(true);
        const payload = { ...fields, email: user.email } as any;
        const res = await authApi.updateProfile(payload);
        if (!res.success || !res.data) return false;
        const updated = (res.data as any).user;
        const profile: UserProfile = {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          phone: updated.phone,
          birthday: updated.birthday,
          cccd: updated.cccd,
          address: updated.address,
          // avatar removed
          climbCount: updated.climbCount,
          lastClimbAt: updated.lastClimbAt,
        };
        localStorage.setItem('userProfile', JSON.stringify(profile));
        setUser(profile);
        return true;
      } finally {
        setIsLoading(false);
      }
    },
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

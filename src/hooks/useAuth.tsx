import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authService } from '@/src/services/api';
import { clearSession, loadSession } from '@/src/services/secureStorage';
import type { CurrentUserResponse, Role } from '@/src/types';

interface AuthContextValue {
  user: CurrentUserResponse | null;
  loading: boolean;
  signIn: (tenantCode: string, identifier: string, password: string, deviceInfo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  role: Role | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const session = await loadSession();
    if (!session) {
      setUser(null);
      return;
    }
    try {
      const me = await authService.getMe();
      setUser(me);
    } catch {
      await clearSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const signIn = useCallback(async (tenantCode: string, identifier: string, password: string, deviceInfo?: string) => {
    await authService.login({ tenantCode, identifier, password, deviceInfo });
    const me = await authService.getMe();
    setUser(me);
  }, []);

  const signOut = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refresh, role: user?.user.role ?? null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

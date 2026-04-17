import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api, AuthUser, tokenStore } from "@/lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    api.auth
      .me()
      .then((r) => setUser(r.user))
      .catch(() => {
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user, token } = await api.auth.signin(email, password);
    tokenStore.set(token);
    setUser(user);
  };

  const signUp = async (email: string, password: string) => {
    const { user, token } = await api.auth.signup(email, password);
    tokenStore.set(token);
    setUser(user);
  };

  const signOut = () => {
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "borrower" | "lender" | "admin";

export interface UserSession {
  name: string;
  role: UserRole;
  borrowerName?: string;
}

interface AuthContextValue {
  user: UserSession | null;
  login: (session: UserSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "udaan_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored) as UserSession);
      }
    } catch {
      setUser(null);
    } finally {
      setHydrated(true);
    }
  }, []);

  if (!hydrated) {
    return null;
  }

  const login = (session: UserSession) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
    const destination = session.role === "borrower" ? "/dashboard" : session.role === "lender" ? "/lender" : "/admin";
    router.push(destination);
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    router.push("/");
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

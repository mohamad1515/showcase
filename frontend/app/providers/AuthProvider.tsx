"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, logout as apiLogout } from "../lib/auth";

type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
} | null;

type AuthContextValue = {
  user: User;
  token?: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  setSession: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const t = window.localStorage.getItem("auth-token");
      const savedUser = window.localStorage.getItem("auth-user");
      if (t) {
        setToken(t);
        if (savedUser) setUser(JSON.parse(savedUser) as NonNullable<User>);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleLogin(email: string, password: string) {
    setLoading(true);
    try {
      const res = await apiLogin({ email, password });
      if (res?.token) {
        handleSetSession(res.token, res.user || null);
      }
      return res.user || null;
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    apiLogout();
    window.localStorage.removeItem("auth-user");
    setUser(null);
    setToken(null);
  }

  function handleSetSession(nextToken: string, nextUser: User) {
    window.localStorage.setItem("auth-token", nextToken);
    if (nextUser) {
      window.localStorage.setItem("auth-user", JSON.stringify(nextUser));
    }
    setToken(nextToken);
    setUser(nextUser);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: handleLogin,
        setSession: handleSetSession,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

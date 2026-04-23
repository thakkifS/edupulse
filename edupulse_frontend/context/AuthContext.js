import { createContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext(null);

const USER_KEY = "edupulse_user";
const TOKEN_KEY = "token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(USER_KEY);
      const token = window.localStorage.getItem(TOKEN_KEY);
      if (saved && token) {
        setUser(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to parse saved user", error);
    } finally {
      setReady(true);
    }
  }, []);

  const login = (nextUser, token) => {
    setUser(nextUser);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    }
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(TOKEN_KEY);
  };

  const updateUser = (partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const merged = { ...prev, ...partial };
      window.localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  const value = useMemo(
    () => ({ user, ready, login, logout, updateUser }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

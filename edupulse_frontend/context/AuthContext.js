import { createContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext(null);

const USER_KEY = "edupulse_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(USER_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to parse saved user", error);
    } finally {
      setReady(true);
    }
  }, []);

  const login = (nextUser) => {
    setUser(nextUser);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(USER_KEY);
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

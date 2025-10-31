import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkMe() {
      try {
        const res = await fetch(`${API_BASE}/api/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (e) {
        console.error("Not authenticated", e);
      } finally {
        setIsLoading(false);
      }
    }
    checkMe();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (e) {
      return { success: false, error: String(e) };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      isAdmin: user?.role === "admin",
    
      setUser,
  
    }),
    [user, isLoading] 
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
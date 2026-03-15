import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AdminSession {
  adminId: number;
  username: string;
  loginTime: number;
}

interface AdminContextType {
  adminSession: AdminSession | null;
  setAdminSession: (session: AdminSession | null) => void;
  isAdminLoggedIn: boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminSession, setAdminSessionState] = useState<AdminSession | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem("adminSession");
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        setAdminSessionState(session);
      } catch (error) {
        console.error("Failed to parse admin session:", error);
        localStorage.removeItem("adminSession");
      }
    }
  }, []);

  const setAdminSession = (session: AdminSession | null) => {
    setAdminSessionState(session);
    if (session) {
      localStorage.setItem("adminSession", JSON.stringify(session));
    } else {
      localStorage.removeItem("adminSession");
    }
  };

  const logout = () => {
    setAdminSession(null);
  };

  const value: AdminContextType = {
    adminSession,
    setAdminSession,
    isAdminLoggedIn: adminSession !== null,
    logout,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}


import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Admin } from "@/types/database";

interface AdminContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (adminData: Admin) => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if admin session exists in localStorage
    const adminSession = localStorage.getItem("adminSession");
    if (adminSession) {
      const parsedAdmin = JSON.parse(adminSession);
      setAdmin(parsedAdmin);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (adminData: Admin) => {
    setAdmin(adminData);
    setIsAuthenticated(true);
    localStorage.setItem("adminSession", JSON.stringify(adminData));
  };

  const logout = () => {
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem("adminSession");
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

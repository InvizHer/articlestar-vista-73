
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { Loader2 } from "lucide-react";
import AdminLayout from "./AdminLayout";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Short timeout to ensure context is properly loaded
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        navigate("/admin");
      }
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  if (isChecking) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-lg">Checking authentication...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;

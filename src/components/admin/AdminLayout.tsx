
import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AdminLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  fullWidth = false 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        
        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <AdminHeader />
          
          <main className={cn(
            "flex-1 overflow-y-auto pb-10",
            isMobile ? "pb-safe" : "",
            fullWidth ? "px-0" : "px-4 md:px-6 lg:px-8"
          )}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "mx-auto",
                fullWidth ? "w-full" : "max-w-7xl"
              )}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

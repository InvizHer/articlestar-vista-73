
import React from "react";
import { cn } from "@/lib/utils";
import AdminSidebar from "./AdminSidebar";
import DashboardHeader from "./DashboardHeader";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  fullWidth = false 
}) => {
  return (
    <div className="min-h-screen h-full w-full flex bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="flex flex-col flex-1 min-h-screen w-full">
        <DashboardHeader />
        
        <motion.main 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }}
          className={cn(
            "flex-1 overflow-auto pb-6",
            fullWidth ? "px-0" : "px-4 md:px-6 lg:px-8"
          )}
        >
          <div className={cn(
            fullWidth ? "w-full" : "max-w-7xl mx-auto"
          )}>
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;

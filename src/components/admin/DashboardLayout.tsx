
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  fullWidth = false 
}) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Set sidebar state when component mounts or when screen size changes
  useEffect(() => {
    // Always closed for mobile and desktop
    setSidebarOpen(false);
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  return (
    <div className="h-screen w-full flex bg-gray-50 dark:bg-gray-900">
      <DashboardSidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
      
      <div className="flex flex-col flex-1 min-h-0">
        <DashboardHeader toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        
        <main className={cn(
          "flex-1 overflow-auto",
          fullWidth ? "px-0" : "px-4 md:px-6 lg:px-8"
        )}>
          <div className={cn(
            "py-6",
            fullWidth ? "w-full" : "max-w-7xl mx-auto"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

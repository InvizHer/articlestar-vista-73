
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
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <DashboardSidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
      
      <div className="flex flex-col flex-1 w-full">
        <DashboardHeader toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        
        <main className={cn(
          "flex-1 overflow-y-auto",
          isMobile ? "pb-safe" : "",
          fullWidth ? "px-0" : "px-4 md:px-6 lg:px-8"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "py-6",
                fullWidth ? "w-full" : "max-w-7xl mx-auto"
              )}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

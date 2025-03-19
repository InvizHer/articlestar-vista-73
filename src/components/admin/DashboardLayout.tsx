
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import AdminSidebar from "./AdminSidebar";
import DashboardHeader from "./DashboardHeader";
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
    // Always closed for mobile, open for desktop
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  return (
    <div className="min-h-screen h-full w-full flex bg-gray-50 dark:bg-gray-900">
      <AdminSidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
      
      <div className="flex flex-col flex-1 min-h-screen w-full">
        <DashboardHeader toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        
        <main className={cn(
          "flex-1 overflow-auto pb-6",
          fullWidth ? "px-0" : "px-4 md:px-6 lg:px-8"
        )}>
          <div className={cn(
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

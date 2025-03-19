
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import AdminSidebar from "./AdminSidebar";
import DashboardHeader from "./DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  fullWidth = false 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen h-full w-full flex bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="flex flex-col flex-1 min-h-screen max-h-screen w-full overflow-hidden">
        <DashboardHeader 
          toggleSidebar={toggleSidebar} 
          sidebarOpen={sidebarOpen} 
        />
        
        <main className={cn(
          "flex-1 overflow-auto pb-6",
          fullWidth ? "px-0" : "px-4 md:px-6 lg:px-8"
        )}>
          <div className={cn(
            "h-full",
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

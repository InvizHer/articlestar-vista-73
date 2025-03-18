
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  FilePlus, 
  ChevronRight,
  BarChart3,
  Newspaper,
  LogOut
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardSidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isOpen: boolean;
  isMobile: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, isOpen, isMobile }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center h-10 px-3 my-1 rounded-lg transition-colors relative overflow-hidden group",
        isActive 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "")} />
      
      {(isOpen || isMobile) && (
        <AnimatePresence mode="wait">
          <motion.span
            initial={{ opacity: 0, width: 0, marginLeft: 0 }}
            animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
            transition={{ duration: 0.2 }}
            className="whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        </AnimatePresence>
      )}
      
      {!isOpen && !isMobile && (
        <div className="absolute left-12 z-50 whitespace-nowrap rounded-md bg-white px-2 py-1 text-sm font-medium text-gray-900 shadow-md opacity-0 group-hover:opacity-100 dark:bg-gray-800 dark:text-gray-100 transition-opacity">
          {label}
        </div>
      )}
    </Link>
  );
};

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, toggle }) => {
  const isMobile = useIsMobile();
  const { logout } = useAdmin();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate("/admin");
  };
  
  const sidebarWidth = isOpen ? (isMobile ? "w-64" : "w-56") : "w-16";
  
  // If mobile and sidebar is closed, don't render anything
  if (isMobile && !isOpen) {
    return null;
  }
  
  const sidebarVariants = {
    open: { width: isMobile ? 256 : 224, transition: { duration: 0.2 } },
    closed: { width: 64, transition: { duration: 0.2 } }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggle}
        />
      )}
      
      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        className={cn(
          "border-r bg-white dark:bg-gray-800 dark:border-gray-700",
          "flex flex-col z-40",
          isMobile ? "fixed inset-y-0 left-0" : "relative border-r h-screen",
          sidebarWidth,
          "transition-all duration-200 ease-in-out"
        )}
      >
        <div className="h-16 flex items-center justify-center border-b dark:border-gray-700 px-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">B</span>
            </div>
            {isOpen && (
              <AnimatePresence mode="wait">
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 whitespace-nowrap overflow-hidden"
                >
                  BlogHub
                </motion.span>
              </AnimatePresence>
            )}
          </Link>
        </div>
        
        <div className="overflow-y-auto flex-1 py-4 px-3">
          <div className="space-y-2">
            <NavItem 
              to="/admin/dashboard" 
              icon={LayoutDashboard} 
              label="Dashboard" 
              isOpen={isOpen}
              isMobile={isMobile}
            />
            
            <div className={cn(
              "mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase",
              !isOpen && !isMobile && "opacity-0"
            )}>
              Content
            </div>
            
            <NavItem 
              to="/admin/articles" 
              icon={FileText} 
              label="Articles" 
              isOpen={isOpen}
              isMobile={isMobile}
            />
            
            <NavItem 
              to="/admin/article/new" 
              icon={FilePlus} 
              label="Create Article" 
              isOpen={isOpen}
              isMobile={isMobile}
            />
            
            <NavItem 
              to="/admin/analytics" 
              icon={BarChart3} 
              label="Analytics" 
              isOpen={isOpen}
              isMobile={isMobile}
            />
          </div>
        </div>
        
        {isOpen && (
          <div className="border-t dark:border-gray-700 p-3">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        )}
        
        {!isMobile && (
          <button
            onClick={toggle}
            className="absolute -right-3 top-20 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-full p-1.5 shadow-sm"
          >
            <ChevronRight className={cn(
              "h-4 w-4 text-gray-500 transition-transform", 
              isOpen ? "rotate-180" : ""
            )} />
          </button>
        )}
      </motion.aside>
    </>
  );
};

export default DashboardSidebar;

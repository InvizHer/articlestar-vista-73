
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  FilePlus, 
  Settings,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  MessageSquare,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
  badge?: number | string;
}

const NavItem: React.FC<NavItemProps> = ({ 
  to, 
  icon: Icon, 
  label, 
  isActive, 
  isCollapsed, 
  isMobile, 
  badge 
}) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            className={cn(
              "flex items-center h-10 px-3 my-1 rounded-lg transition-colors relative",
              isActive 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "")} />
            
            {(!isCollapsed || isMobile) && (
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
            
            {badge && (!isCollapsed || isMobile) && (
              <span className="ml-auto bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </Link>
        </TooltipTrigger>
        {isCollapsed && !isMobile && (
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { admin, logout } = useAdmin();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Set sidebar state when component mounts or when screen size changes
  useEffect(() => {
    setIsCollapsed(!isMobile);
    setIsMobileOpen(false);
  }, [isMobile]);
  
  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const isActive = (path: string) => location.pathname === path;
  
  // If mobile and sidebar is not open, only render the toggle button
  if (isMobile && !isMobileOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 rounded-full shadow-md bg-white dark:bg-gray-800"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>
    );
  }

  // Sidebar width based on state
  const sidebarWidth = !isCollapsed ? (isMobile ? "w-64" : "w-64") : "w-16";
  
  // Animation variants
  const sidebarVariants = {
    open: { width: 256, transition: { duration: 0.2 } },
    closed: { width: 64, transition: { duration: 0.2 } }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}
      
      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={!isCollapsed ? "open" : "closed"}
        className={cn(
          "border-r bg-white dark:bg-gray-800 dark:border-gray-700",
          "flex flex-col z-40",
          isMobile ? "fixed inset-y-0 left-0" : "relative border-r h-full",
          sidebarWidth,
          "transition-all duration-200 ease-in-out"
        )}
      >
        <div className="h-16 flex items-center justify-between border-b dark:border-gray-700 px-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">B</span>
            </div>
            {!isCollapsed && (
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
          
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <div className="overflow-y-auto flex-1 py-4 px-3">
          <div className="space-y-1">
            <NavItem 
              to="/admin/dashboard" 
              icon={LayoutDashboard} 
              label="Dashboard" 
              isActive={isActive("/admin/dashboard")}
              isCollapsed={isCollapsed}
              isMobile={isMobile}
            />
            
            {!isCollapsed && (
              <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Content
              </div>
            )}
            
            <NavItem 
              to="/admin/articles" 
              icon={FileText} 
              label="Articles" 
              isActive={isActive("/admin/articles")}
              isCollapsed={isCollapsed}
              isMobile={isMobile}
            />
            
            <NavItem 
              to="/admin/article/new" 
              icon={FilePlus} 
              label="Create Article" 
              isActive={isActive("/admin/article/new")}
              isCollapsed={isCollapsed}
              isMobile={isMobile}
            />
            
            <NavItem 
              to="/admin/comments" 
              icon={MessageSquare} 
              label="Comments" 
              isActive={isActive("/admin/comments")}
              isCollapsed={isCollapsed}
              isMobile={isMobile}
              badge={5}
            />
            
            <NavItem 
              to="/admin/analytics" 
              icon={BarChart3} 
              label="Analytics" 
              isActive={isActive("/admin/analytics")}
              isCollapsed={isCollapsed}
              isMobile={isMobile}
            />
            
            {!isCollapsed && (
              <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Settings
              </div>
            )}
            
            <NavItem 
              to="/admin/profile" 
              icon={User} 
              label="Profile" 
              isActive={isActive("/admin/profile")}
              isCollapsed={isCollapsed}
              isMobile={isMobile}
            />
            
            <NavItem 
              to="/admin/settings" 
              icon={Settings} 
              label="Settings" 
              isActive={isActive("/admin/settings")}
              isCollapsed={isCollapsed}
              isMobile={isMobile}
            />
          </div>
        </div>
        
        {/* User profile and logout section */}
        <div className="border-t dark:border-gray-700 p-3 mt-auto">
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {admin?.username?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{admin?.username || 'Admin'}</span>
                  <span className="text-xs text-muted-foreground">Administrator</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout}
                    className="w-full text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Logout
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {/* Collapse/Expand button */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-full p-1.5 shadow-sm"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )}
      </motion.aside>
    </>
  );
};

export default AdminSidebar;

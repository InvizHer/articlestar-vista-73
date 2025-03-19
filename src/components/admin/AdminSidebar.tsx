
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard,
  FileText, 
  FilePlus,
  MessageSquare,
  BarChart3,
  LogOut,
  ChevronLeft,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/context/AdminContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAdmin();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const isActive = (path: string) => location.pathname === path;

  // If mobile and sidebar is closed, show only a button to open it
  if (isMobile && !isOpen) {
    return (
      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed z-50 top-4 left-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md"
        aria-label="Open sidebar"
      >
        <LayoutDashboard className="h-5 w-5 text-primary" />
      </motion.button>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.aside 
        initial={false}
        animate={{
          width: isOpen ? (isMobile ? 280 : 240) : 80,
          transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
        }}
        className={cn(
          "bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col h-screen z-50",
          isMobile ? "fixed left-0 top-0" : "relative",
          "shadow-sm transition-all duration-300"
        )}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center px-4 border-b dark:border-gray-800">
          <Link to="/admin/dashboard" className="flex items-center gap-2 overflow-hidden">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 truncate"
                >
                  BlogHub
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          
          {!isMobile && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="ml-auto p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <motion.div
                animate={{ rotate: isOpen ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              </motion.div>
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <ul className="space-y-2">
            <NavItem
              to="/admin/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              isOpen={isOpen}
              isActive={isActive("/admin/dashboard")}
            />
            <NavItem
              to="/admin/articles"
              icon={FileText}
              label="Articles"
              isOpen={isOpen}
              isActive={isActive("/admin/articles")}
            />
            <NavItem
              to="/admin/article/new"
              icon={FilePlus}
              label="New Article"
              isOpen={isOpen}
              isActive={isActive("/admin/article/new")}
            />
            <NavItem
              to="/admin/comments"
              icon={MessageSquare}
              label="Comments"
              isOpen={isOpen}
              isActive={isActive("/admin/comments")}
            />
            <NavItem
              to="/admin/analytics"
              icon={BarChart3}
              label="Analytics"
              isOpen={isOpen}
              isActive={isActive("/admin/analytics")}
            />
            <NavItem
              to="/admin/settings"
              icon={Settings}
              label="Settings"
              isOpen={isOpen}
              isActive={isActive("/admin/settings")}
            />
          </ul>
        </nav>

        {/* Logout button */}
        <div className="p-3 border-t dark:border-gray-800">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className={cn(
              "flex items-center w-full rounded-md py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
              isOpen ? "px-3" : "px-0 justify-center"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <AnimatePresence>
              {isOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-3"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
        
        {/* Mobile close button */}
        {isMobile && isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
        )}
      </motion.aside>
    </>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isOpen: boolean;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, isOpen, isActive }) => {
  return (
    <li>
      <Link
        to={to}
        className={cn(
          "flex items-center rounded-md py-2.5 transition-colors relative group",
          isOpen ? "px-3" : "px-0 justify-center",
          isActive 
            ? "bg-primary/10 text-primary font-medium" 
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        <motion.div
          whileHover={{ scale: isActive ? 1 : 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "")} />
        </motion.div>
        
        <AnimatePresence>
          {isOpen ? (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="ml-3 truncate"
            >
              {label}
            </motion.span>
          ) : (
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.1 }}
              className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </li>
  );
};

export default AdminSidebar;

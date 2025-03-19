
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard,
  FileText,
  FilePlus,
  Settings,
  MessageSquare,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/context/AdminContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAdmin();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: React.ElementType; label: string }) => (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
        isActive(path)
          ? "bg-primary/10 text-primary"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      <Icon className="h-5 w-5" />
      {isOpen && <span>{label}</span>}
    </Link>
  );

  // If mobile and sidebar is not open, don't render
  if (isMobile && !isOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed z-50 top-4 left-4 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md"
      >
        <LayoutDashboard className="h-5 w-5" />
      </button>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={toggleSidebar}
        />
      )}

      <aside className={cn(
        "bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col h-screen z-50 transition-all duration-300",
        isMobile ? "fixed left-0 top-0" : "relative",
        isOpen ? "w-64" : "w-16"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b dark:border-gray-700 px-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            {isOpen && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">BlogHub</span>
            )}
          </Link>
        </div>

        {/* Nav items */}
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-2">
            <NavItem path="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem path="/admin/articles" icon={FileText} label="Articles" />
            <NavItem path="/admin/article/new" icon={FilePlus} label="New Article" />
            <NavItem path="/admin/comments" icon={MessageSquare} label="Comments" />
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t dark:border-gray-700 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>

        {/* Toggle button (desktop only) */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-full p-1.5 shadow-sm"
          >
            <div className={cn("h-4 w-4 text-gray-500 transition-transform", isOpen ? "rotate-180" : "rotate-0")}>
              {isOpen ? "←" : "→"}
            </div>
          </button>
        )}
      </aside>
    </>
  );
};

export default AdminSidebar;

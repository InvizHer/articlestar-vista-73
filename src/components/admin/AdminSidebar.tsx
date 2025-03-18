
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard,
  FileText,
  FilePlus,
  Users,
  Settings,
  Tag,
  BarChart2,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  end?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ 
  to, 
  icon: Icon, 
  label, 
  active = false,
  end = false
}) => {
  return (
    <Link 
      to={to} 
      end={end}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active 
          ? "bg-primary/10 text-primary" 
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
};

const NavGroup: React.FC<{ 
  title: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"
        >
          {title}
          <ChevronRight 
            className={cn(
              "h-4 w-4 transition-transform", 
              isOpen && "rotate-90"
            )} 
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 px-1 py-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  // Collapse sidebar on mobile by default
  React.useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  const isActive = (path: string, end: boolean = false) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  if (isCollapsed) {
    return null;
  }

  return (
    <aside className="w-64 border-r bg-white dark:bg-slate-800 dark:border-slate-700 h-screen flex-shrink-0 hidden md:block">
      <div className="h-16 flex items-center justify-center border-b dark:border-slate-700">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold">B</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            BlogHub
          </span>
        </Link>
      </div>
      
      <div className="overflow-y-auto h-[calc(100vh-4rem)] py-4 px-3">
        <div className="space-y-6">
          <div className="space-y-1">
            <NavItem 
              to="/admin/dashboard" 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={isActive("/admin/dashboard", true)}
              end
            />
          </div>
          
          <NavGroup title="Content" defaultOpen>
            <NavItem 
              to="/admin/article/new" 
              icon={FilePlus} 
              label="New Article" 
              active={isActive("/admin/article/new")}
            />
            <NavItem 
              to="/admin/articles" 
              icon={FileText} 
              label="All Articles" 
              active={isActive("/admin/dashboard") && !isActive("/admin/dashboard", true)}
            />
            <NavItem 
              to="/admin/categories" 
              icon={Tag} 
              label="Categories" 
              active={isActive("/admin/categories")}
            />
          </NavGroup>
          
          <NavGroup title="Analytics">
            <NavItem 
              to="/admin/analytics" 
              icon={BarChart2} 
              label="Statistics" 
              active={isActive("/admin/analytics")}
            />
          </NavGroup>
          
          <NavGroup title="Management">
            <NavItem 
              to="/admin/users" 
              icon={Users} 
              label="Users" 
              active={isActive("/admin/users")}
            />
            <NavItem 
              to="/admin/settings" 
              icon={Settings} 
              label="Settings" 
              active={isActive("/admin/settings")}
            />
          </NavGroup>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;


import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X, Moon, Sun, Laptop, Palette, ChevronUp, ChevronDown } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const { theme, setTheme, themeColor, setThemeColor } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/articles", label: "Articles" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" }
  ];

  const themeColors = [
    { name: "Default", value: "default", color: "bg-slate-600" },
    { name: "Blue", value: "blue", color: "bg-blue-600" },
    { name: "Purple", value: "purple", color: "bg-purple-600" },
    { name: "Green", value: "green", color: "bg-green-600" },
    { name: "Orange", value: "orange", color: "bg-orange-600" },
    { name: "Pink", value: "pink", color: "bg-pink-600" }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="hidden sm:inline-block font-bold text-xl group-hover:text-primary transition-colors">BlogHub</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors hover:text-primary after:content-[''] after:block after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full",
                  isActive ? "text-primary after:w-full" : "text-muted-foreground after:w-0"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 transition-all" />
                ) : theme === "light" ? (
                  <Sun className="h-5 w-5 transition-all" />
                ) : (
                  <Laptop className="h-5 w-5 transition-all" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border border-primary/10 p-2 animate-zoom-in">
              <DropdownMenuLabel className="px-3 flex items-center gap-2 mb-1">
                <Palette className="h-4 w-4 text-primary" />
                <span>Appearance</span>
              </DropdownMenuLabel>
              
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  onClick={() => setTheme("light")} 
                  className={cn(
                    "flex justify-between px-3 py-2 cursor-pointer rounded-lg mb-1 transition-colors hover:bg-accent gap-3",
                    theme === "light" ? "bg-accent" : ""
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </div>
                  {theme === "light" && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setTheme("dark")} 
                  className={cn(
                    "flex justify-between px-3 py-2 cursor-pointer rounded-lg mb-1 transition-colors hover:bg-accent gap-3",
                    theme === "dark" ? "bg-accent" : ""
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </div>
                  {theme === "dark" && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setTheme("system")} 
                  className={cn(
                    "flex justify-between px-3 py-2 cursor-pointer rounded-lg mb-1 transition-colors hover:bg-accent gap-3",
                    theme === "system" ? "bg-accent" : ""
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4" />
                    <span>System</span>
                  </div>
                  {theme === "system" && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator className="my-2" />
              
              <DropdownMenuLabel className="px-3 flex items-center gap-2 mb-1">
                <Palette className="h-4 w-4 text-primary" />
                <span>Theme Color</span>
              </DropdownMenuLabel>
              
              <div className="grid grid-cols-3 gap-1 px-1 py-1">
                {themeColors.map((color) => (
                  <Button
                    key={color.value}
                    variant="ghost"
                    className={cn(
                      "h-9 w-full justify-start gap-2 px-2 py-1 text-xs rounded-lg transition-colors",
                      themeColor === color.value ? "bg-accent" : "hover:bg-accent/50"
                    )}
                    onClick={() => setThemeColor(color.value as any)}
                  >
                    <div className={`h-3 w-3 rounded-full ${color.color}`} />
                    <span>{color.name}</span>
                    {themeColor === color.value && 
                      <div className="ml-auto h-2 w-2 rounded-full bg-primary"></div>
                    }
                  </Button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            asChild 
            size="sm" 
            className="hidden sm:flex rounded-full transition-all duration-300 hover:scale-105 hover:shadow-md animate-fade-in"
          >
            <Link to="/articles">
              <BookOpen className="h-4 w-4 mr-2" />
              <span>Articles</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full hover:bg-primary/10"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden border-t"
        >
          <nav className="container mx-auto py-4 px-4 flex flex-col">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "py-3 px-4 flex rounded-lg text-sm font-medium transition-colors hover:bg-primary/10",
                      isActive ? "text-primary bg-primary/5" : "text-muted-foreground"
                    )
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navItems.length * 0.05 }}
              className="mt-3"
            >
              <Button 
                asChild 
                size="sm" 
                className="w-full rounded-lg justify-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to="/articles">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read Articles
                </Link>
              </Button>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Navigation;

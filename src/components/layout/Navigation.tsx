
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X, Moon, Sun, Laptop, Palette } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { BookmarksDialog } from "@/components/common/BookmarksDialog";

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
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="hidden sm:inline-block font-bold text-xl">BlogHub</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <BookmarksDialog />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5" />
                ) : theme === "light" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Laptop className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Theme Mode</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setTheme("light")} className={theme === "light" ? "bg-accent" : ""}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className={theme === "dark" ? "bg-accent" : ""}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className={theme === "system" ? "bg-accent" : ""}>
                <Laptop className="mr-2 h-4 w-4" />
                System Default
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="flex items-center">
                <Palette className="mr-2 h-4 w-4" />
                Theme Color
              </DropdownMenuLabel>
              
              <div className="grid grid-cols-3 gap-1 p-2">
                {themeColors.map((color) => (
                  <Button
                    key={color.value}
                    variant="ghost"
                    className={cn(
                      "h-8 w-full justify-start px-2 hover:bg-accent",
                      themeColor === color.value && "bg-accent"
                    )}
                    onClick={() => setThemeColor(color.value as any)}
                  >
                    <div className={`h-4 w-4 rounded-full ${color.color} mr-2`} />
                    <span className="text-xs">{color.name}</span>
                  </Button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild size="sm" className="hidden sm:flex">
            <Link to="/articles">
              <BookOpen className="h-4 w-4 mr-2" />
              Read Articles
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="md:hidden border-t"
        >
          <nav className="container mx-auto py-4 px-4 flex flex-col">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "py-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Button asChild size="sm" className="mt-4">
              <Link to="/articles" onClick={() => setIsMenuOpen(false)}>
                <BookOpen className="h-4 w-4 mr-2" />
                Read Articles
              </Link>
            </Button>
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Navigation;

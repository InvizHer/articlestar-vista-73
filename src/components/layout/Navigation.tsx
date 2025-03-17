
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAdmin();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-background"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 transition-all duration-300">
                BlogHub
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/" label="Home" />
            <NavLink to="/articles" label="Articles" />
            <NavLink to="/about" label="About" />
            <NavLink to="/contact" label="Contact" />
            {isAuthenticated && (
              <NavLink to="/admin/dashboard" label="Dashboard" />
            )}
            <Button variant="ghost" size="icon" className="ml-2 text-muted-foreground hover:text-primary">
              <Search className="h-5 w-5" />
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              className={isMenuOpen ? "text-primary" : "text-muted-foreground hover:text-primary"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <MobileNavLink to="/" label="Home" onClick={() => setIsMenuOpen(false)} />
            <MobileNavLink to="/articles" label="Articles" onClick={() => setIsMenuOpen(false)} />
            <MobileNavLink to="/about" label="About" onClick={() => setIsMenuOpen(false)} />
            <MobileNavLink to="/contact" label="Contact" onClick={() => setIsMenuOpen(false)} />
            {isAuthenticated && (
              <MobileNavLink to="/admin/dashboard" label="Dashboard" onClick={() => setIsMenuOpen(false)} />
            )}
          </div>
        </div>
      )}
    </header>
  );
};

// Desktop nav link component
const NavLink = ({ to, label }: { to: string; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to !== "/" && location.pathname.startsWith(to));
  
  return (
    <Link
      to={to}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors relative group ${
        isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:text-primary"
      }`}
    >
      {label}
      <span 
        className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 ${
          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </Link>
  );
};

// Mobile nav link component
const MobileNavLink = ({ to, label, onClick }: { to: string; label: string; onClick: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to !== "/" && location.pathname.startsWith(to));
  
  return (
    <Link
      to={to}
      className={`block py-2 px-4 text-base font-medium rounded-md transition-colors ${
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-muted hover:text-primary"
      }`}
      onClick={onClick}
    >
      {label}
    </Link>
  );
};

export default Navigation;

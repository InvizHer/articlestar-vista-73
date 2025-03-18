
import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  noAnimation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  fullWidth = false,
  noAnimation = false 
}) => {
  const isMobile = useIsMobile();
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const Wrapper = noAnimation ? React.Fragment : motion.div;
  const wrapperProps = noAnimation 
    ? {} 
    : {
        variants: containerVariants,
        initial: "hidden",
        animate: "visible"
      };

  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-background",
      isMobile ? "pb-safe" : ""
    )}>
      <Navigation />
      <Wrapper {...wrapperProps}>
        <main className={cn(
          "flex-grow",
          fullWidth 
            ? "" 
            : "container mx-auto px-4 py-6 sm:px-6 lg:px-8"
        )}>
          {children}
        </main>
      </Wrapper>
      <Footer />
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg hover:shadow-xl"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Layout;

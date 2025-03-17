
import React, { useEffect, useState } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronUp, BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Article } from "@/types/blog";

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
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  
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

  useEffect(() => {
    const handleScroll = () => {
      // Show scroll to top button when scrolled down 300px
      setShowScrollToTop(window.scrollY > 300);
      
      // Calculate reading progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      
      if (documentHeight > 0) {
        setReadingProgress(Math.min((scrolled / documentHeight) * 100, 100));
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
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
      
      {/* Reading progress bar - only shows on article pages with sufficient content */}
      {readingProgress > 0 && (
        <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
          <div 
            className="h-full bg-primary transition-all duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}
      
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
      {showScrollToTop && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <Button 
            onClick={scrollToTop} 
            size="icon" 
            className="rounded-full shadow-lg"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Layout;

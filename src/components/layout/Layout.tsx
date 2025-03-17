
import React from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    </div>
  );
};

export default Layout;

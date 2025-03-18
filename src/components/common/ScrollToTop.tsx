
import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ScrollToTopProps {
  threshold?: number;
  showLabel?: boolean;
  position?: "bottom-right" | "bottom-center";
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ 
  threshold = 500,
  showLabel = false,
  position = "bottom-right"
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.pageYOffset > threshold);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-center": "bottom-6 left-1/2 transform -translate-x-1/2"
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className={`fixed ${positionClasses[position]} z-50`}
        >
          <Button
            onClick={scrollToTop}
            className={`rounded-full shadow-lg hover:shadow-xl ${showLabel ? 'px-4' : 'h-10 w-10'}`}
            aria-label="Scroll to top"
          >
            <ArrowUp className={`h-5 w-5 ${showLabel ? 'mr-2' : ''}`} />
            {showLabel && <span>Top</span>}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;

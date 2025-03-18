
import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface ScrollToTopProps {
  threshold?: number;
  showLabel?: boolean;
  position?: "bottom-right" | "bottom-center";
  showProgress?: boolean;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ 
  threshold = 500,
  showLabel = false,
  position = "bottom-right",
  showProgress = true
}) => {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const currentScrollPos = window.pageYOffset;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollPercentage = (currentScrollPos / maxScroll) * 100;
      
      setScrollProgress(scrollPercentage);
      setVisible(currentScrollPos > threshold);
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
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          className={`fixed ${positionClasses[position]} z-50`}
        >
          {showProgress ? (
            <div className="relative">
              <svg className="w-14 h-14">
                <circle
                  className="text-muted stroke-[3]"
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle
                  className="text-primary stroke-[3] transform -rotate-90 origin-center"
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={24 * 2 * Math.PI}
                  strokeDashoffset={24 * 2 * Math.PI * (1 - scrollProgress / 100)}
                />
              </svg>
              <Button
                onClick={scrollToTop}
                className="absolute inset-0 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center bg-gradient-to-tr from-primary/90 to-purple-500 hover:bg-primary/90 text-primary-foreground"
                aria-label="Scroll to top"
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={scrollToTop}
              className={`rounded-full shadow-lg hover:shadow-xl bg-gradient-to-tr from-primary/90 to-purple-500 ${showLabel ? 'px-4' : 'h-10 w-10'}`}
              aria-label="Scroll to top"
            >
              <ArrowUp className={`h-5 w-5 ${showLabel ? 'mr-2' : ''}`} />
              {showLabel && <span>Top</span>}
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;

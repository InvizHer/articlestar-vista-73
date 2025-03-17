
import { useEffect } from "react";

export function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (lock) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Add styles to body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Remove styles and restore scroll position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [lock]);
}

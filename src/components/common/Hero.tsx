
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface HeroProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
}

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink = "/articles",
  backgroundImage,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.9,
      behavior: "smooth",
    });
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const { clientX, clientY } = e;
      const { width, height } = heroRef.current.getBoundingClientRect();
      
      const xPos = clientX / width - 0.5;
      const yPos = clientY / height - 0.5;
      
      const glowElements = heroRef.current.querySelectorAll('.glow-effect');
      
      glowElements.forEach((el) => {
        const glowEl = el as HTMLElement;
        glowEl.style.transform = `translate(${xPos * 20}px, ${yPos * 20}px)`;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={heroRef}
      className="relative min-h-[95vh] flex items-center justify-center overflow-hidden"
    >
      {backgroundImage ? (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-background"></div>
        </div>
      ) : (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5"></div>
          <div className="absolute glow-effect -top-[30%] -right-[20%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px] opacity-60"></div>
          <div className="absolute glow-effect -bottom-[30%] -left-[20%] w-[70%] h-[70%] rounded-full bg-purple-500/20 blur-[120px] opacity-60"></div>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
        </div>
      )}
      
      <div className="absolute w-full h-full">
        <div className="absolute top-20 left-[10%] w-2 h-2 rounded-full bg-primary animate-pulse-soft"></div>
        <div className="absolute top-[30%] right-[15%] w-3 h-3 rounded-full bg-purple-400 animate-pulse-soft delay-300"></div>
        <div className="absolute bottom-[25%] left-[20%] w-2 h-2 rounded-full bg-pink-400 animate-pulse-soft delay-700"></div>
        <div className="absolute bottom-[15%] right-[25%] w-2 h-2 rounded-full bg-primary animate-pulse-soft delay-500"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.3,
            type: "spring",
            stiffness: 100
          }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 text-sm"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-primary font-medium">Inspiring stories, curated for you</span>
        </motion.div>
        
        <motion.h1 
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 ${
            backgroundImage 
              ? "text-white" 
              : "bg-clip-text text-transparent bg-gradient-to-br from-primary via-purple-600 to-pink-500"
          }`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.5,
            type: "spring",
            stiffness: 50
          }}
        >
          {title.split(' ').map((word, i) => (
            <span key={i} className="inline-block mx-1 relative">
              {word}
              {i === 1 && (
                <motion.span 
                  className="absolute -bottom-1 left-0 w-full h-1 bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                />
              )}
            </span>
          ))}
        </motion.h1>
        
        {subtitle && (
          <motion.p 
            className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${
              backgroundImage ? "text-white/90" : "text-muted-foreground"
            }`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {subtitle}
          </motion.p>
        )}
        
        {ctaText && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              asChild 
              size="lg" 
              className="rounded-full px-8 py-6 text-lg shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all duration-300 group bg-gradient-to-br from-primary to-purple-600 border-0"
            >
              <Link to={ctaLink} className="flex items-center">
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className={`rounded-full px-8 py-6 text-lg ${
                backgroundImage 
                  ? "bg-white/10 text-white border-white/20 hover:bg-white/20" 
                  : "bg-white backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/5"
              } shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
              onClick={() => scrollToContent()}
            >
              Explore Stories
            </Button>
          </motion.div>
        )}
      </motion.div>
      
      <motion.div 
        className="absolute bottom-10 left-0 right-0 flex justify-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          onClick={() => scrollToContent()}
          className="cursor-pointer p-3 rounded-full bg-primary/10 backdrop-blur-md hover:bg-primary/20 transition-colors"
        >
          <ChevronDown className={`h-6 w-6 ${backgroundImage ? "text-white" : "text-primary"}`} />
        </motion.div>
      </motion.div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-5"></div>
    </div>
  );
};

export default Hero;

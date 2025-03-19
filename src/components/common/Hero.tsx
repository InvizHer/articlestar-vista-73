
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
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
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.9,
      behavior: "smooth",
    });
  };

  return (
    <div 
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
    >
      {backgroundImage ? (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 via-background to-primary/10 animated-gradient">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.15),transparent_60%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(var(--primary),0.15),transparent_60%)]"></div>
        </div>
      )}
      
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-background to-transparent z-10 opacity-60"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        <motion.h1 
          className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 ${backgroundImage ? "text-white" : "bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {title}
        </motion.h1>
        
        {subtitle && (
          <motion.p 
            className={`text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto ${backgroundImage ? "text-white/90" : "text-muted-foreground"}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {subtitle}
          </motion.p>
        )}
        
        {ctaText && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 mr-4">
              <Link to={ctaLink}>
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className={`rounded-full px-8 py-6 text-lg ${backgroundImage ? "bg-white/10 text-white border-white/20 hover:bg-white/20" : "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"} backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
              onClick={() => scrollToContent()}
            >
              Explore
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
    </div>
  );
};

export default Hero;

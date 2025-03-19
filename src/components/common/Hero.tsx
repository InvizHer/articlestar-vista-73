
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
  return (
    <div 
      className={`relative py-20 px-6 md:py-32 md:px-10 rounded-lg overflow-hidden ${backgroundImage ? "text-white" : "bg-muted"}`}
    >
      {backgroundImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            {subtitle}
          </p>
        )}
        
        {ctaText && (
          <Button asChild size="lg">
            <Link to={ctaLink}>
              {ctaText}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Hero;

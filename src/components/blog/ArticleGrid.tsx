
import React, { useRef, useEffect } from "react";
import { Article } from "@/types/blog";
import ArticleCard from "./ArticleCard";
import { motion } from "framer-motion";

interface ArticleGridProps {
  articles: Article[];
  columns?: 1 | 2 | 3;
  variant?: "default" | "featured" | "compact" | "editor-pick";
  heading?: string;
  subheading?: string;
}

const ArticleGrid: React.FC<ArticleGridProps> = ({ 
  articles, 
  columns = 3,
  variant = "default",
  heading,
  subheading
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const cards = grid.querySelectorAll(".article-card-wrapper");
    cards.forEach((card) => observer.observe(card));
    
    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, [articles]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const child = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 15
      }
    }
  };

  return (
    <div className="space-y-10">
      {(heading || subheading) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-12"
        >
          {heading && (
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {subheading}
            </p>
          )}
          <div className="mt-6 w-24 h-1 bg-gradient-to-r from-primary to-purple-600 rounded-full mx-auto"></div>
        </motion.div>
      )}
      
      <motion.div 
        ref={gridRef}
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className={`grid ${gridCols[columns]} gap-8 md:gap-10`}
      >
        {articles.map((article, index) => (
          <motion.div 
            key={article.id} 
            variants={child}
            className="article-card-wrapper"
            whileHover={{ 
              y: -5,
              transition: { duration: 0.2 }
            }}
          >
            <ArticleCard 
              article={article} 
              variant={variant}
              index={index}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ArticleGrid;

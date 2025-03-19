
import React from "react";
import { Article } from "@/types/blog";
import ArticleCard from "./ArticleCard";
import { motion } from "framer-motion";

interface ArticleGridProps {
  articles: Article[];
  columns?: 1 | 2 | 3;
  variant?: "default" | "featured" | "compact" | "editor-pick";
}

const ArticleGrid: React.FC<ArticleGridProps> = ({ 
  articles, 
  columns = 3,
  variant = "default"
}) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className={`grid ${gridCols[columns]} gap-6 md:gap-8`}
    >
      {articles.map((article, index) => (
        <ArticleCard 
          key={article.id} 
          article={article} 
          variant={variant}
          index={index}
        />
      ))}
    </motion.div>
  );
};

export default ArticleGrid;

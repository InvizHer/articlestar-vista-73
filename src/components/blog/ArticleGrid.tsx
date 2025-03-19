
import React from "react";
import { Article } from "@/types/blog";
import ArticleCard from "./ArticleCard";
import { motion } from "framer-motion";

interface ArticleGridProps {
  articles: Article[];
  columns?: 1 | 2 | 3;
}

const ArticleGrid: React.FC<ArticleGridProps> = ({ articles, columns = 3 }) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <motion.div 
      className={`grid ${gridCols[columns]} gap-6`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {articles.map((article, index) => (
        <ArticleCard 
          key={article.id} 
          article={article} 
          index={index}
          variant="default" // Ensuring all cards use the 'default' variant like recent stories
        />
      ))}
    </motion.div>
  );
};

export default ArticleGrid;

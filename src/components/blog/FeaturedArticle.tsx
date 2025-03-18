
import React from "react";
import { Article } from "@/types/blog";
import ArticleCard from "./ArticleCard";
import { motion } from "framer-motion";

interface FeaturedArticleProps {
  article: Article;
}

const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className="absolute -left-4 md:-left-10 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="bg-muted/50 h-40 w-2 rounded-full"></div>
      </div>
      <ArticleCard article={article} variant="featured" />
    </motion.div>
  );
};

export default FeaturedArticle;

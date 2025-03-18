
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
      <ArticleCard article={article} variant="featured" />
    </motion.div>
  );
};

export default FeaturedArticle;

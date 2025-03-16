
import React from "react";
import { Article } from "@/types/blog";
import ArticleCard from "./ArticleCard";

interface FeaturedArticleProps {
  article: Article;
}

const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article }) => {
  return <ArticleCard article={article} variant="featured" />;
};

export default FeaturedArticle;


import React from "react";
import { Article } from "@/types/blog";
import ArticleCard from "./ArticleCard";

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
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default ArticleGrid;


import React from "react";
import { Link } from "react-router-dom";
import { Article } from "@/types/blog";
import { CalendarIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured";
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, variant = "default" }) => {
  const isFeatured = variant === "featured";

  return (
    <article className={`group overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md ${isFeatured ? "flex flex-col md:flex-row" : ""}`}>
      <Link 
        to={`/article/${article.slug}`} 
        className={`block ${isFeatured ? "md:w-2/5" : "aspect-video w-full"} overflow-hidden bg-muted`}
      >
        <img
          src={article.coverImage}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      
      <div className={`flex flex-col p-6 ${isFeatured ? "md:w-3/5" : ""}`}>
        <Link to={`/articles?category=${article.category}`}>
          <Badge variant="outline" className="mb-3 w-fit hover:bg-primary hover:text-primary-foreground">
            {article.category}
          </Badge>
        </Link>

        <Link to={`/article/${article.slug}`}>
          <h3 className={`${isFeatured ? "text-2xl" : "text-xl"} font-bold leading-tight tracking-tight mb-2 group-hover:text-primary transition-colors`}>
            {article.title}
          </h3>
        </Link>

        <p className="text-muted-foreground mb-4 line-clamp-2">
          {article.excerpt}
        </p>

        <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{article.date}</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;

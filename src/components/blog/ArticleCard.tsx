
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Article } from "@/types/blog";
import { CalendarIcon, Clock, ArrowUpRight, Bookmark, BookmarkCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured" | "compact";
  index?: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, variant = "default", index = 0 }) => {
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [isBookmarkedLocally, setIsBookmarkedLocally] = useState<boolean | null>(null);
  
  // Get the current bookmark status
  const bookmarkStatus = isBookmarkedLocally !== null 
    ? isBookmarkedLocally 
    : isBookmarked(article.id);
  
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Update local state immediately for UI responsiveness
    setIsBookmarkedLocally(!bookmarkStatus);
    // Then update the actual state
    toggleBookmark(article);
  };
  
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={cn(
        "group h-full overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md",
        isFeatured ? "flex flex-col md:flex-row" : "flex flex-col",
        isCompact && "border-0 shadow-none"
      )}
    >
      <Link 
        to={`/article/${article.slug}`} 
        className={cn(
          "block overflow-hidden bg-muted relative",
          isFeatured ? "md:w-2/5 h-60 md:h-auto" : isCompact ? "aspect-square w-full" : "aspect-video w-full"
        )}
      >
        <img
          src={article.coverImage}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-3 right-3 bg-primary text-primary-foreground p-2 rounded-full transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </Link>
      
      <div className={cn(
        "flex flex-col p-6",
        isFeatured ? "md:w-3/5" : "",
        isCompact && "p-4",
        "flex-grow relative"
      )}>
        <div className="absolute top-6 right-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-background/80"
            onClick={handleBookmarkClick}
          >
            {bookmarkStatus ? (
              <BookmarkCheck className="h-4 w-4 fill-primary text-primary" />
            ) : (
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        <div className="mb-3">
          <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground">
            {article.category}
          </Badge>
        </div>

        <Link to={`/article/${article.slug}`} className="group/title">
          <h3 className={cn(
            "font-bold leading-tight tracking-tight mb-3 group-hover/title:text-primary transition-colors",
            isFeatured ? "text-2xl md:text-3xl" : isCompact ? "text-lg" : "text-xl"
          )}>
            {article.title}
          </h3>
        </Link>

        {!isCompact && (
          <p className="text-muted-foreground mb-4 line-clamp-2 flex-grow">
            {article.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
              <img 
                src={article.author.avatar} 
                alt={article.author.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="truncate">{article.author.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span className="hidden sm:inline">{article.date.split(' ').slice(0, 2).join(' ')}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ArticleCard;

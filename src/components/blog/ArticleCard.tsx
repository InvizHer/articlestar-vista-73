
import React from "react";
import { Link } from "react-router-dom";
import { Article } from "@/types/blog";
import { CalendarIcon, Clock, ArrowUpRight, Bookmark, Eye, Tag, Heart } from "lucide-react";
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

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  variant = "default", 
  index = 0 
}) => {
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";
  const { isBookmarked, toggleBookmark } = useBookmarks();
  
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(article);
  };
  
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={cn(
        "group h-full overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg",
        isFeatured ? "flex flex-col md:flex-row" : "flex flex-col",
        isCompact && "border-0 shadow-none",
        "relative"
      )}
    >
      <Link 
        to={`/article/${article.slug}`} 
        className={cn(
          "block overflow-hidden relative",
          isFeatured ? "md:w-2/5 h-60 md:h-auto" : isCompact ? "aspect-square w-full" : "aspect-video w-full",
          "bg-gradient-to-br from-primary/5 to-muted"
        )}
      >
        <img
          src={article.coverImage}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
        
        {article.category && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary/90 hover:bg-primary text-white shadow-sm backdrop-blur-sm">
              {article.category}
            </Badge>
          </div>
        )}
        
        {article.viewCount !== undefined && (
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-black/40 text-white backdrop-blur-sm flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.viewCount}
            </Badge>
          </div>
        )}
        
        {!isCompact && (
          <div className="absolute bottom-3 right-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40"
              onClick={handleBookmarkClick}
            >
              <Bookmark 
                className={cn(
                  "h-4 w-4 text-white transition-colors",
                  isBookmarked(article.id) ? "fill-white" : ""
                )} 
              />
            </Button>
          </div>
        )}
      </Link>
      
      <div className={cn(
        "flex flex-col p-5",
        isFeatured ? "md:w-3/5" : "",
        isCompact && "p-3",
        "flex-grow"
      )}>
        <Link 
          to={`/article/${article.slug}`} 
          className="group-hover:text-primary transition-colors"
        >
          <h3 className={cn(
            "font-bold leading-tight tracking-tight mb-2",
            isFeatured ? "text-2xl" : isCompact ? "text-lg" : "text-xl"
          )}>
            {article.title}
          </h3>
        </Link>

        {!isCompact && (
          <p className="text-muted-foreground mb-3 line-clamp-2">
            {article.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden border flex-shrink-0">
              <img 
                src={article.author.avatar} 
                alt={article.author.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="truncate">{article.author.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" title={article.date}>
              <CalendarIcon className="h-3 w-3" />
              <span className="hidden sm:inline-block">{article.date.split(' ')[0]}</span>
            </div>

            <div className="flex items-center gap-1" title={`${article.readTime} read time`}>
              <Clock className="h-3 w-3" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
        <div className="absolute bottom-3 left-0 right-0 mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
          <ArrowUpRight className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
    </motion.article>
  );
};

export default ArticleCard;

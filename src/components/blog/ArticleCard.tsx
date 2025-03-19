
import React from "react";
import { Link } from "react-router-dom";
import { Article } from "@/types/blog";
import { CalendarIcon, Clock, ArrowUpRight, Eye, Bookmark, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured" | "compact" | "editor-pick";
  index?: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  variant = "default", 
  index = 0 
}) => {
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";
  const isEditorPick = variant === "editor-pick";
  
  if (isEditorPick) {
    return (
      <motion.article 
        className="group h-full overflow-hidden rounded-2xl relative bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-200 dark:border-slate-800"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-purple-500/5 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-md">
            Editor's Pick
          </Badge>
        </div>
        
        <Link 
          to={`/article/${article.slug}`} 
          className="block overflow-hidden"
        >
          <div className="aspect-video w-full relative">
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-4 left-4 flex space-x-2">
              {article.tags?.slice(0, 2).map((tag, i) => (
                <Badge key={i} variant="outline" className="bg-black/40 text-white backdrop-blur-sm border-white/10">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="p-5 relative">
            <h3 className="text-xl font-bold tracking-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h3>
            
            <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
              {article.excerpt}
            </p>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/20 mr-2">
                  <img 
                    src={article.author.avatar} 
                    alt={article.author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium">{article.author.name}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1" title={article.date}>
                  <CalendarIcon className="h-3 w-3 text-primary/70" />
                  <span>{article.date.split(' ')[0]}</span>
                </div>
                
                <div className="flex items-center gap-1" title={`${article.readTime} read time`}>
                  <Clock className="h-3 w-3 text-primary/70" />
                  <span>{article.readTime}</span>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <ArrowUpRight className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Link>
        
        <div className="absolute top-3 right-3 flex space-x-2">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-700"
          >
            <Heart className="h-4 w-4 text-pink-500" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-700"
          >
            <Bookmark className="h-4 w-4 text-primary" />
          </motion.button>
        </div>
      </motion.article>
    );
  }
  
  return (
    <motion.article 
      className={cn(
        "group h-full overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-200 dark:border-slate-800",
        isFeatured ? "flex flex-col md:flex-row" : "flex flex-col",
        isCompact && "shadow-none hover:shadow-none",
        "relative"
      )}
    >
      <Link 
        to={`/article/${article.slug}`} 
        className={cn(
          "block overflow-hidden relative",
          isFeatured ? "md:w-1/2 h-60 md:h-auto" : isCompact ? "aspect-square w-full" : "aspect-video w-full"
        )}
      >
        <img
          src={article.coverImage}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className={cn(
          "absolute inset-0",
          isFeatured 
            ? "bg-gradient-to-r from-primary/60 via-black/50 to-transparent" 
            : "bg-gradient-to-t from-black/70 via-black/30 to-transparent"
        )}></div>
        
        {article.category && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-gradient-to-r from-primary to-purple-500 text-white border-0 shadow-md">
              {article.category}
            </Badge>
          </div>
        )}
        
        <div className="absolute top-4 right-4 flex space-x-2">
          <Badge variant="outline" className="bg-black/40 text-white backdrop-blur-sm border-white/10 flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {article.viewCount || 0}
          </Badge>
        </div>
        
        {isFeatured && (
          <div className="absolute inset-0 p-8 flex flex-col justify-center md:block hidden">
            <h2 className="text-3xl font-bold text-white mb-4 max-w-md drop-shadow-md">
              {article.title}
            </h2>
            <p className="text-white/90 mb-6 max-w-md line-clamp-2 drop-shadow-md">
              {article.excerpt}
            </p>
            <div className="inline-flex items-center text-white gap-2 font-medium">
              Read Article
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        )}
      </Link>
      
      <div className={cn(
        "flex flex-col p-5",
        isFeatured ? "md:w-1/2" : "",
        isCompact && "p-3",
        "flex-grow relative"
      )}>
        {isFeatured && (
          <Badge 
            variant="outline" 
            className="mb-4 self-start text-primary border-primary/20 bg-primary/5 px-3 py-1"
          >
            Featured Story
          </Badge>
        )}
        
        {!isFeatured && (
          <Link 
            to={`/article/${article.slug}`} 
            className="group-hover:text-primary transition-colors"
          >
            <h3 className={cn(
              "font-bold leading-tight tracking-tight mb-3",
              isFeatured ? "text-2xl" : isCompact ? "text-lg" : "text-xl",
              isFeatured ? "md:hidden" : ""
            )}>
              {article.title}
            </h3>
          </Link>
        )}

        {!isCompact && !isFeatured && (
          <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
            {article.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0 group-hover:border-primary transition-colors">
              <img 
                src={article.author.avatar} 
                alt={article.author.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="truncate font-medium">{article.author.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" title={article.date}>
              <CalendarIcon className="h-3 w-3 text-primary/70" />
              <span className="hidden sm:inline-block">{article.date.split(' ')[0]}</span>
            </div>

            <div className="flex items-center gap-1" title={`${article.readTime} read time`}>
              <Clock className="h-3 w-3 text-primary/70" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
        
        <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-gradient-to-br from-primary/5 to-purple-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>
      
      <div className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-primary flex items-center justify-center scale-0 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg">
        <ArrowUpRight className="h-4 w-4 text-white" />
      </div>
    </motion.article>
  );
};

export default ArticleCard;


import React from "react";
import { Link } from "react-router-dom";
import { Article } from "@/types/blog";
import { CalendarIcon, Clock, ArrowUpRight, Eye, BookmarkPlus } from "lucide-react";
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
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="group h-full overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-md transition-all relative"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 blur-3xl opacity-60 z-0"></div>
        
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-gradient-to-r from-primary to-purple-500 text-white shadow-sm">
            Editor's Pick
          </Badge>
        </div>
        
        <Link 
          to={`/article/${article.slug}`} 
          className="block overflow-hidden"
        >
          <div className="aspect-[16/9] w-full bg-muted relative">
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent"></div>
          </div>
          
          <div className="p-5 relative">
            <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h3>
            
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {article.excerpt}
            </p>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>{article.date.split(' ')[0]}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{article.readTime}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{article.viewCount || 0}</span>
                </div>
              </div>
              
              <span className="inline-flex items-center text-primary font-medium text-sm">
                Read More
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </span>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }
  
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group h-full bg-card rounded-xl overflow-hidden flex flex-col relative border shadow-sm hover:shadow-md transition-all"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-3xl opacity-50 z-0 group-hover:opacity-70 transition-opacity"></div>
      
      <Link 
        to={`/article/${article.slug}`} 
        className="block relative overflow-hidden"
      >
        <div className="aspect-[16/9] w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover transform transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10 opacity-50 group-hover:opacity-70 transition-opacity"></div>
        </div>
        
        {article.category && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-md backdrop-blur-sm">
              {article.category}
            </Badge>
          </div>
        )}
        
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant="outline" className="bg-black/40 text-white backdrop-blur-sm flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {article.viewCount || 0}
          </Badge>
          
          <Badge variant="outline" className="bg-black/40 text-white backdrop-blur-sm flex items-center gap-1 hover:bg-primary/80 transition-colors cursor-pointer">
            <BookmarkPlus className="h-3 w-3" />
          </Badge>
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-grow relative z-10">
        <div className="mb-2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden border flex-shrink-0">
            <img 
              src={article.author.avatar} 
              alt={article.author.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm text-muted-foreground">{article.author.name}</span>
        </div>
        
        <Link 
          to={`/article/${article.slug}`} 
          className="block group-hover:text-primary transition-colors"
        >
          <h3 className="font-bold tracking-tight text-xl mb-2 line-clamp-2">
            {article.title}
          </h3>
        </Link>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3 mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" title={article.date}>
              <CalendarIcon className="h-3 w-3" />
              <span>{article.date.split(' ')[0]}</span>
            </div>

            <div className="flex items-center gap-1" title={`${article.readTime} read time`}>
              <Clock className="h-3 w-3" />
              <span>{article.readTime}</span>
            </div>
          </div>
          
          <Link to={`/article/${article.slug}`} className="text-primary font-medium text-xs flex items-center hover:underline">
            Read Article
            <ArrowUpRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

export default ArticleCard;

import React from "react";
import { Link } from "react-router-dom";
import { Article } from "@/types/blog";
import { CalendarIcon, Clock, ArrowUpRight, Eye } from "lucide-react";
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
        className="group h-full overflow-hidden rounded-xl border relative"
      >
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/20 to-transparent z-0"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-primary/80 to-purple-500/80 blur-3xl opacity-30 z-0"></div>
        
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
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          </div>
          
          <div className="p-5 relative">
            <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            
            <p className="text-muted-foreground mb-3 line-clamp-2">
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
      className="group h-full overflow-hidden rounded-xl border transition-all hover:shadow-md"
    >
      <Link 
        to={`/article/${article.slug}`} 
        className="block overflow-hidden relative"
      >
        <div className="aspect-video w-full bg-muted overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
          
          {article.category && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-primary/90 hover:bg-primary text-white shadow-sm backdrop-blur-sm">
                {article.category}
              </Badge>
            </div>
          )}
          
          <div className="absolute bottom-3 right-3">
            <Badge variant="outline" className="bg-black/40 text-white backdrop-blur-sm flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.viewCount || 0}
            </Badge>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link 
          to={`/article/${article.slug}`} 
          className="block group-hover:text-primary transition-colors mb-2"
        >
          <h3 className="font-bold tracking-tight text-lg line-clamp-2">
            {article.title}
          </h3>
        </Link>

        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden border flex-shrink-0">
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
              <span>{article.date.split(' ')[0]}</span>
            </div>

            <div className="flex items-center gap-1" title={`${article.readTime} read time`}>
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

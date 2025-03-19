
import React from "react";
import { Link } from "react-router-dom";
import { Article } from "@/types/blog";
import { CalendarIcon, Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured";
  index?: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  variant = "default", 
  index = 0 
}) => {
  const isFeatured = variant === "featured";
  const { themeColor } = useTheme();
  
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group h-full flex flex-col bg-card rounded-xl overflow-hidden border shadow-sm hover:shadow transition-all"
    >
      <Link 
        to={`/article/${article.slug}`} 
        className="block relative overflow-hidden"
      >
        <div className="aspect-video w-full bg-muted">
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        
        {/* Category and view count at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex items-center gap-2">
          {article.category && (
            <Badge 
              className={`bg-${themeColor}-500 hover:bg-${themeColor}-600 border-none text-white`}
            >
              {article.category}
            </Badge>
          )}
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{article.viewCount}</span>
          </Badge>
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <Link 
          to={`/article/${article.slug}`}
          className="block"
        >
          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between border-t pt-3 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border flex-shrink-0">
              <img 
                src={article.author.avatar} 
                alt={article.author.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">{article.author.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {article.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.readTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ArticleCard;

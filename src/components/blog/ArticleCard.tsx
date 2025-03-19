
import React from "react";
import { Link } from "react-router-dom";
import { Article } from "@/types/blog";
import { CalendarIcon, Clock, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
        
        {article.category && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-background/80 backdrop-blur-sm">
              {article.category}
            </Badge>
          </div>
        )}
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

        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3 mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span>{article.date.split(' ')[0]}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{article.readTime}</span>
            </div>
          </div>
          
          <Link to={`/article/${article.slug}`} className="text-primary font-medium text-xs flex items-center hover:underline">
            Read
            <ArrowUpRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

export default ArticleCard;

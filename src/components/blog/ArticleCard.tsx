
import React from "react";
import { Link } from "react-router-dom";
import { Article } from "@/types/blog";
import { CalendarIcon, Clock, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured";
  index?: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, variant = "default", index = 0 }) => {
  const isFeatured = variant === "featured";
  
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`group h-full overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md ${
        isFeatured ? "flex flex-col md:flex-row" : "flex flex-col"
      }`}
    >
      <Link 
        to={`/article/${article.slug}`} 
        className={`block ${isFeatured ? "md:w-2/5 h-60 md:h-auto" : "aspect-video w-full"} overflow-hidden bg-muted relative`}
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
      
      <div className={`flex flex-col p-6 ${isFeatured ? "md:w-3/5" : ""} flex-grow`}>
        <div className="mb-3">
          <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground">
            {article.category}
          </Badge>
        </div>

        <Link to={`/article/${article.slug}`} className="group/title">
          <h3 className={`${isFeatured ? "text-2xl md:text-3xl" : "text-xl"} font-bold leading-tight tracking-tight mb-3 group-hover/title:text-primary transition-colors`}>
            {article.title}
          </h3>
        </Link>

        <p className="text-muted-foreground mb-4 line-clamp-2 flex-grow">
          {article.excerpt}
        </p>

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

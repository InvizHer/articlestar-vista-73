
import React from "react";
import { Article } from "@/types/blog";
import { Link } from "react-router-dom";
import { CalendarIcon, Clock, ArrowUpRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeaturedArticleProps {
  article: Article;
}

const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative"
    >
      <article className="group relative h-[500px] w-full overflow-hidden rounded-xl border shadow-md">
        <div className="absolute inset-0 z-0">
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>
        </div>
        
        <div className="absolute top-5 left-5 z-10 flex items-center gap-3">
          {article.category && (
            <Badge className="bg-primary/90 hover:bg-primary text-white shadow-sm">
              {article.category}
            </Badge>
          )}
          
          {article.viewCount !== undefined && (
            <Badge variant="outline" className="bg-black/40 text-white backdrop-blur-sm flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.viewCount}
            </Badge>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
          <span className="inline-block text-sm text-white/80 mb-2">Featured Article</span>
          <Link to={`/article/${article.slug}`} className="block group-hover:text-primary transition-colors">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
              {article.title}
            </h2>
          </Link>
          
          <p className="text-white/80 mb-6 line-clamp-2 max-w-3xl">
            {article.excerpt}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
                <img 
                  src={article.author.avatar} 
                  alt={article.author.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium text-white">{article.author.name}</div>
                <div className="flex items-center text-xs text-white/70 gap-3">
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
            
            <Button asChild variant="secondary" className="rounded-full gap-2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-0">
              <Link to={`/article/${article.slug}`}>
                Read Article
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </article>
    </motion.div>
  );
};

export default FeaturedArticle;

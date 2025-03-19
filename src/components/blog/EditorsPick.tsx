
import React from "react";
import { Link } from "react-router-dom";
import { Article } from "@/types/blog";
import { 
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface EditorsPickProps {
  article: Article;
}

const EditorsPick: React.FC<EditorsPickProps> = ({ article }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-md transition-all"
    >
      <div className="grid md:grid-cols-2 gap-0">
        <div className="relative aspect-video md:aspect-auto overflow-hidden">
          <img 
            src={article.coverImage} 
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
          
          <div className="absolute left-4 top-4">
            <Badge className="bg-white text-foreground shadow-sm px-3 py-1">
              Editor's Pick
            </Badge>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <Badge variant="secondary" className="mb-2 bg-primary text-white border-0">
              {article.category}
            </Badge>
            <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">{article.title}</h2>
            <div className="flex items-center gap-3 text-white/90 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {article.date.split(',')[0]}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {article.readTime}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {article.viewCount || 0}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full border overflow-hidden mr-3">
                <img 
                  src={article.author.avatar} 
                  alt={article.author.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium text-sm">{article.author.name}</h3>
                <p className="text-xs text-muted-foreground">Author</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-5">
              <p className="text-muted-foreground line-clamp-3">
                {article.excerpt}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags?.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-primary/5">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <Button asChild className="gap-2 w-full sm:w-auto mt-2">
            <Link to={`/article/${article.slug}`}>
              Read Article
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default EditorsPick;

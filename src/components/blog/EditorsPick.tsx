
import React from "react";
import { Link } from "react-router-dom";
import { Article } from "@/types/blog";
import { 
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  Award
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
      className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-background to-primary/5 border shadow-xl"
    >
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/20 filter blur-3xl opacity-70"></div>
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary/20 filter blur-3xl opacity-70"></div>
      
      <div className="absolute top-6 left-6 z-10">
        <Badge className="bg-primary/80 text-white shadow-md flex items-center gap-1.5 px-3 py-1.5">
          <Award className="h-3.5 w-3.5" />
          Editor's Pick
        </Badge>
      </div>
      
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto">
          <img 
            src={article.coverImage} 
            alt={article.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent opacity-60 md:block hidden"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60 md:hidden block"></div>
          
          {/* Info overlay for mobile */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:hidden">
            <Badge variant="secondary" className="mb-3 bg-primary/90 text-white border-0">
              {article.category}
            </Badge>
            <h2 className="text-2xl font-bold text-white mb-3">{article.title}</h2>
            <div className="flex items-center gap-3 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {article.readTime}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {article.viewCount}
              </span>
            </div>
          </div>
          
          {/* Info overlay for desktop */}
          <div className="absolute inset-0 p-8 flex flex-col justify-center md:block hidden">
            <Badge variant="secondary" className="mb-3 bg-primary/90 text-white border-0">
              {article.category}
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 max-w-md">{article.title}</h2>
            <p className="text-white/80 mb-5 max-w-md line-clamp-3">{article.excerpt}</p>
            <div className="flex items-center gap-4 text-white/80 text-sm mb-6">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {article.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {article.readTime}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {article.viewCount} views
              </span>
            </div>
            <Button asChild className="w-fit gap-2 shadow-lg">
              <Link to={`/article/${article.slug}`}>
                Read Article
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="p-6 md:p-8 md:block hidden bg-gradient-to-br from-transparent to-primary/5">
          <div className="flex items-center mb-5">
            <div className="w-12 h-12 rounded-full border-2 border-primary/20 overflow-hidden mr-4">
              <img 
                src={article.author.avatar} 
                alt={article.author.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium">{article.author.name}</h3>
              <p className="text-sm text-muted-foreground">Author & Editor</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <h3 className="text-xl font-semibold">About this article</h3>
            <p className="text-muted-foreground">
              {article.excerpt}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags?.map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-primary/5 hover:bg-primary/10">
                {tag}
              </Badge>
            ))}
          </div>
          
          <Button asChild className="gap-2 w-full md:w-auto mt-auto">
            <Link to={`/article/${article.slug}`}>
              Read Complete Article
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Footer for mobile only */}
      <div className="p-6 border-t md:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
              <img 
                src={article.author.avatar} 
                alt={article.author.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium text-sm">{article.author.name}</h3>
              <p className="text-xs text-muted-foreground">Author & Editor</p>
            </div>
          </div>
          
          <Button asChild size="sm" variant="default" className="gap-1.5">
            <Link to={`/article/${article.slug}`}>
              Read
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default EditorsPick;

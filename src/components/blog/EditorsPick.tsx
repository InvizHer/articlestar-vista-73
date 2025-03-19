
import React from "react";
import { Link } from "react-router-dom";
import { Article } from "@/types/blog";
import { 
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  Award,
  BookOpen,
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
      className="relative overflow-hidden rounded-3xl shadow-xl border border-primary/10"
    >
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 filter blur-[100px] opacity-60"></div>
        <div className="absolute bottom-0 -left-20 h-48 w-48 rounded-full bg-blue-500/20 filter blur-[80px] opacity-50"></div>
      </div>
      
      <div className="grid md:grid-cols-12">
        {/* Image column */}
        <div className="md:col-span-7 h-full">
          <div className="relative h-64 md:h-full min-h-[320px] lg:min-h-[420px]">
            <img 
              src={article.coverImage} 
              alt={article.title}
              className="h-full w-full object-cover"
            />
            
            {/* Mobile gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent md:hidden"></div>
            
            {/* Desktop gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent hidden md:block"></div>
            
            {/* Editor Badge */}
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="outline" className="bg-primary/80 text-white border-0 shadow-lg backdrop-blur-sm flex items-center gap-1.5 px-3 py-1.5">
                <Award className="h-3.5 w-3.5" />
                Editor's Pick
              </Badge>
            </div>
            
            {/* Title and meta info - desktop & tablet */}
            <div className="absolute inset-0 p-8 flex flex-col justify-center md:block hidden">
              <Badge variant="secondary" className="mb-4 bg-primary/90 text-white border-0">
                {article.category}
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 max-w-md leading-tight">
                {article.title}
              </h2>
              <p className="text-white/90 mb-6 max-w-md line-clamp-2 text-lg">
                {article.excerpt}
              </p>
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
              <Button asChild className="w-fit gap-2 shadow-lg bg-white text-primary hover:bg-white/90 hover:text-primary/90 group">
                <Link to={`/article/${article.slug}`}>
                  Read Article
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Mobile view overlay content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 md:hidden">
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
                  {article.viewCount} views
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content column */}
        <div className="md:col-span-5 p-6 md:p-8 bg-gradient-to-br from-background to-primary/5">
          {/* Author info */}
          <div className="flex items-center mb-6 gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-primary/20 overflow-hidden">
              <img 
                src={article.author.avatar} 
                alt={article.author.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-lg">{article.author.name}</h3>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <User className="h-3 w-3 mr-1" />
                  Author
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Expert in {article.category}</p>
            </div>
          </div>
          
          {/* About this article - desktop only */}
          <div className="space-y-4 mb-6 hidden md:block">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 bg-primary rounded-full"></div>
              <h3 className="text-xl font-semibold">About this article</h3>
            </div>
            <p className="text-muted-foreground">
              {article.excerpt}
            </p>
            <div className="flex items-center text-sm text-muted-foreground gap-3 mt-3">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                {article.readTime} read
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                {new Date(article.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
          
          {/* Tags */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Related Topics:</h4>
            <div className="flex flex-wrap gap-2">
              {article.tags?.map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-primary/5 hover:bg-primary/10 transition-colors">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Read Button - larger and more prominent for mobile */}
          <div className="mt-4 md:hidden">
            <Button asChild size="lg" className="w-full gap-2">
              <Link to={`/article/${article.slug}`}>
                Read Complete Article
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {/* Desktop read button */}
          <div className="hidden md:block">
            <Button asChild className="gap-2 group w-full">
              <Link to={`/article/${article.slug}`}>
                Read Complete Article
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EditorsPick;


import React from "react";
import { Article } from "@/types/blog";
import { Link } from "react-router-dom";
import { CalendarIcon, Clock, ArrowRight, Eye, Award, BookOpen } from "lucide-react";
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
      <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/20 filter blur-[100px] opacity-70 z-0"></div>
      <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/20 filter blur-[100px] opacity-70 z-0"></div>
      
      <article className="group relative overflow-hidden rounded-2xl border bg-card shadow-lg hover:shadow-xl transition-all duration-500 z-10">
        <div className="grid md:grid-cols-2 relative">
          <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-black/50 to-transparent opacity-60"></div>
            
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              <Badge className="bg-primary/90 hover:bg-primary text-white shadow-sm backdrop-blur-sm">
                {article.category}
              </Badge>
              
              <Badge variant="outline" className="bg-black/40 text-white backdrop-blur-sm flex items-center gap-1 border-white/20">
                <Eye className="h-3 w-3" />
                {article.viewCount} views
              </Badge>
              
              <Badge variant="outline" className="bg-primary/40 text-white backdrop-blur-sm flex items-center gap-1 border-primary/30">
                <Award className="h-3 w-3" />
                Featured
              </Badge>
            </div>
            
            <div className="absolute inset-0 flex flex-col justify-center md:px-8 px-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-md text-shadow">
                  {article.title}
                </h2>
                
                <p className="text-white/90 mb-6 max-w-md line-clamp-3 text-shadow-sm">
                  {article.excerpt}
                </p>
              </motion.div>
              
              <div className="hidden md:block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <Button asChild className="rounded-full shadow-lg bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300">
                    <Link to={`/article/${article.slug}`} className="gap-2">
                      Read Article
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-8 relative flex flex-col z-10">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-card via-primary/5 to-card opacity-50 z-0"></div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-full border-2 border-primary/20 overflow-hidden mr-4">
                  <img 
                    src={article.author.avatar} 
                    alt={article.author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{article.author.name}</h3>
                  <p className="text-sm text-muted-foreground">Author & Editor</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6 border-l-4 border-primary/30 pl-4">
                <h3 className="text-xl font-semibold">About this article</h3>
                <p className="text-muted-foreground">
                  {article.excerpt}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4 text-primary/80" />
                    {article.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary/80" />
                    {article.readTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-primary/80" />
                    {article.readTime}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-primary/5 hover:bg-primary/10 border-primary/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-auto relative z-10"
            >
              <Button asChild className="gap-2 w-full md:w-auto rounded-full shadow-md group">
                <Link to={`/article/${article.slug}`}>
                  Read Complete Article
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
        
        <div className="md:hidden p-6 border-t flex items-center justify-between relative z-10 bg-gradient-to-r from-primary/5 to-card">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-primary/20">
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
          
          <Button asChild size="sm" variant="default" className="gap-1.5 rounded-full">
            <Link to={`/article/${article.slug}`}>
              Read
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </article>
    </motion.div>
  );
};

export default FeaturedArticle;

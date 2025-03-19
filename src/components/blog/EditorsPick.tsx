
import React from "react";
import { Link } from "react-router-dom";
import { Article } from "@/types/blog";
import { Calendar, Clock, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

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
      className="relative overflow-hidden"
    >
      <Card className="overflow-hidden border-primary/10">
        <div className="grid md:grid-cols-2 lg:grid-cols-5">
          {/* Image column */}
          <div className="relative lg:col-span-3">
            <div className="relative h-64 md:h-full min-h-[300px]">
              <img 
                src={article.coverImage} 
                alt={article.title}
                className="h-full w-full object-cover"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
              
              {/* Editor's Pick Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary/90 text-white border-0 px-3 py-1.5">
                  Editor's Pick
                </Badge>
              </div>
              
              {/* Mobile & desktop overlay content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <Badge variant="secondary" className="mb-3 bg-white/20 backdrop-blur-sm text-white border-0">
                  {article.category}
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
                  {article.title}
                </h2>
                <div className="flex items-center gap-3 text-white/80 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {article.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {article.readTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    {article.viewCount} views
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content column */}
          <div className="lg:col-span-2 p-6 md:p-8 bg-card flex flex-col">
            {/* Author info */}
            <div className="flex items-center mb-6 gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-primary/20 overflow-hidden">
                <img 
                  src={article.author.avatar} 
                  alt={article.author.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{article.author.name}</h3>
                <p className="text-sm text-muted-foreground">{article.category} Expert</p>
              </div>
            </div>
            
            {/* About this article */}
            <div className="mb-6 flex-grow">
              <p className="text-muted-foreground">
                {article.excerpt}
              </p>
            </div>
            
            {/* Read Button */}
            <div className="mt-auto">
              <Button asChild className="w-full gap-2 group">
                <Link to={`/article/${article.slug}`}>
                  Read Complete Article
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default EditorsPick;


import React from "react";
import { Link } from "react-router-dom";
import { Article } from "@/types/blog";
import { Calendar, Clock, Eye, ArrowRight, Bookmark } from "lucide-react";
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
    >
      <Card className="overflow-hidden border-primary/10 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="grid md:grid-cols-5 lg:grid-cols-2">
          {/* Image column - larger on large screens */}
          <div className="relative md:col-span-2 lg:col-span-1">
            <div className="relative h-64 md:h-full min-h-[250px]">
              <img 
                src={article.coverImage} 
                alt={article.title}
                className="h-full w-full object-cover"
              />
              
              {/* Editor's Pick Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-primary px-3 py-1.5 rounded-full shadow-sm">
                <Bookmark className="h-4 w-4" />
                <span className="font-medium">Editor's Pick</span>
              </div>
              
              {/* Category Badge */}
              <div className="absolute bottom-4 left-4">
                <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm border-0">
                  {article.category}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Content column */}
          <div className="md:col-span-3 lg:col-span-1 p-6 flex flex-col">
            {/* Title and meta info */}
            <div className="mb-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
                {article.title}
              </h2>
              <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
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
            
            {/* Excerpt */}
            <p className="text-muted-foreground mb-6 flex-grow">
              {article.excerpt}
            </p>
            
            {/* Author and CTA */}
            <div className="mt-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
                    <img 
                      src={article.author.avatar} 
                      alt={article.author.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{article.author.name}</h3>
                  </div>
                </div>
                
                <Button asChild variant="outline" size="sm" className="gap-1 group">
                  <Link to={`/article/${article.slug}`}>
                    Read
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default EditorsPick;

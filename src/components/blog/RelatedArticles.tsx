
import React from 'react';
import { Article } from '@/types/blog';
import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface RelatedArticlesProps {
  articles: Article[];
  currentArticleId: string;
}

export function RelatedArticles({ articles, currentArticleId }: RelatedArticlesProps) {
  // Filter out current article and limit to 3 related articles
  const relatedArticles = articles
    .filter(article => article.id !== currentArticleId)
    .slice(0, 3);

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-bold">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedArticles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group"
          >
            <Link to={`/article/${article.slug}`} className="block">
              <div className="rounded-xl overflow-hidden aspect-[16/9] mb-3">
                <img 
                  src={article.coverImage} 
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <Badge variant="outline" className="bg-primary/5 mb-2">
                {article.category}
              </Badge>
              <h4 className="font-medium text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{article.readTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{article.viewCount} views</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

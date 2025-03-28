
import React, { useState, useEffect } from "react";
import { Article } from "@/types/blog";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, MoreVertical, Edit, Trash2, Eye, Heart } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface ArticleListItemProps {
  article: Article;
  onDelete?: (id: string) => void;
}

const ArticleListItem: React.FC<ArticleListItemProps> = ({ 
  article,
  onDelete
}) => {
  const [likesCount, setLikesCount] = useState<number>(0);

  useEffect(() => {
    const fetchLikesCount = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_like_count', { p_article_id: article.id });
        
        if (error) throw error;
        setLikesCount(data || 0);
      } catch (error) {
        console.error('Error fetching likes count:', error);
      }
    };

    fetchLikesCount();
  }, [article.id]);

  // Parse the date string to a Date object
  const articleDate = new Date(article.date);
  const timeAgo = formatDistanceToNow(articleDate, { addSuffix: true });
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/10 transition-colors"
    >
      <div className="hidden md:block w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
        <img 
          src={article.coverImage} 
          alt={article.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
          <h3 className="font-medium text-base line-clamp-1">{article.title}</h3>
          <Badge variant={article.published ? "default" : "outline"} className="md:ml-2 w-fit">
            {article.published ? "Published" : "Draft"}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-1 mb-2 md:mb-0">
          {article.excerpt}
        </p>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            {timeAgo}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readTime}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {article.viewCount || 0} views
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-red-500" />
            {likesCount} likes
          </span>
          <Badge variant="secondary" className="font-normal text-xs">
            {article.category}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-2 md:mt-0 self-end md:self-center">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link to={`/article/${article.slug}`} target="_blank">
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link to={`/admin/article/${article.id}`}>
            <Edit className="h-4 w-4" />
          </Link>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/admin/article/${article.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/article/${article.slug}`} target="_blank">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete && onDelete(article.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

export default ArticleListItem;

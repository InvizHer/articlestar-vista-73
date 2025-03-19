
import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LikeButtonProps {
  articleId: string;
  className?: string;
  showCount?: boolean;
  size?: "default" | "sm" | "lg";
}

const LikeButton: React.FC<LikeButtonProps> = ({ 
  articleId, 
  className, 
  showCount = true,
  size = "default"
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLikeCount();
  }, [articleId]);

  const fetchLikeCount = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_like_count', { p_article_id: articleId });
      
      if (error) throw error;
      setLikeCount(data || 0);
    } catch (error) {
      console.error('Error fetching like count:', error);
    }
  };

  const handleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (!isLiked) {
        const { data, error } = await supabase
          .rpc('toggle_like', { p_article_id: articleId });
        
        if (error) throw error;
        // Here we ensure data is of type number before setting it
        if (typeof data === 'number') {
          setLikeCount(data);
        }
        setIsLiked(true);
        toast.success('Article liked!');
      } else {
        const { data, error } = await supabase
          .rpc('remove_like', { p_article_id: articleId });
        
        if (error) throw error;
        // Here we ensure data is of type number before setting it
        if (typeof data === 'number') {
          setLikeCount(data);
        }
        setIsLiked(false);
        toast.success('Like removed');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    } finally {
      setIsLoading(false);
    }
  };

  const sizes = {
    default: "h-9 px-4 gap-2",
    sm: "h-8 px-3 text-xs gap-1.5",
    lg: "h-10 px-5 gap-2"
  };

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      className={cn(
        sizes[size],
        isLiked && "bg-red-500 hover:bg-red-600 border-red-500", 
        "focus:ring-red-500",
        className
      )}
      onClick={handleLike}
      disabled={isLoading}
    >
      <Heart 
        className={cn(
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4", 
          isLiked && "fill-white"
        )} 
      />
      {showCount && <span>{likeCount}</span>}
    </Button>
  );
};

export default LikeButton;

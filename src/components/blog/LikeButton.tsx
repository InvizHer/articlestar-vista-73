
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
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get stored email if exists
    const storedEmail = localStorage.getItem('user_email');
    if (storedEmail) {
      setUserEmail(storedEmail);
      checkIfLiked(storedEmail);
    }
    
    fetchLikeCount();
  }, [articleId, userEmail]);

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

  const checkIfLiked = async (email: string) => {
    if (!email) return;
    
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_email', email)
        .maybeSingle();
      
      if (error) throw error;
      setIsLiked(!!data);
    } catch (error) {
      console.error('Error checking if article is liked:', error);
    }
  };

  const handleLike = async () => {
    if (isLoading) return;
    
    if (!userEmail) {
      // Ask for email if not stored
      const email = prompt('Please enter your email to like this article:');
      if (!email || !email.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }
      localStorage.setItem('user_email', email);
      setUserEmail(email);
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .rpc('toggle_like', { 
          p_article_id: articleId, 
          p_user_email: userEmail 
        });
      
      if (error) throw error;
      
      setIsLiked(data);
      fetchLikeCount(); // Refresh count
      
      toast.success(data ? 'Article liked!' : 'Like removed');
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


import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import CommentForm from "./CommentForm";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

interface CommentsProps {
  articleId: string;
}

const Comments: React.FC<CommentsProps> = ({ articleId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllComments, setShowAllComments] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchComments = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("article_id", articleId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setComments(data || []);
      setTotalCount(data?.length || 0);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);
  const hasMoreComments = comments.length > 3;

  return (
    <div id="comments" className="pt-6">
      <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Discussion ({totalCount})
      </h3>
      
      <CommentForm articleId={articleId} onCommentAdded={fetchComments} />
      
      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-center">
              <p className="text-muted-foreground">Loading comments...</p>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 border-t border-b">
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <>
            {displayedComments.map((comment) => (
              <div key={comment.id} className="pb-6 border-b last:border-0">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-medium flex-shrink-0">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{comment.name}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{comment.content}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Heart className="h-3.5 w-3.5 mr-1" />
                      <span>Like</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {hasMoreComments && (
              <Button
                variant="ghost"
                className="w-full text-sm font-medium"
                onClick={() => setShowAllComments(!showAllComments)}
              >
                {showAllComments ? (
                  <span className="flex items-center">
                    Show fewer comments <ChevronUp className="ml-1 h-4 w-4" />
                  </span>
                ) : (
                  <span className="flex items-center">
                    Show all {comments.length} comments <ChevronDown className="ml-1 h-4 w-4" />
                  </span>
                )}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Comments;

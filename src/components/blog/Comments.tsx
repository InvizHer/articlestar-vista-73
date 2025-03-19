
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Heart, ChevronDown, ChevronUp, Reply, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CommentForm from "./CommentForm";
import { cn } from "@/lib/utils";
import { Comment, CommentReply } from "@/types/blog";
import CommentReplyForm from "./CommentReplyForm";

interface CommentsProps {
  articleId: string;
}

const Comments: React.FC<CommentsProps> = ({ articleId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<{[key: string]: CommentReply[]}>({});
  const [loading, setLoading] = useState(true);
  const [showAllComments, setShowAllComments] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      
      // Fetch replies for each comment
      if (data && data.length > 0) {
        await fetchReplies(data.map(comment => comment.id));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (commentIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from("comment_replies")
        .select("*")
        .in("comment_id", commentIds)
        .order("created_at", { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Group replies by comment_id
      const repliesMap: {[key: string]: CommentReply[]} = {};
      data?.forEach(reply => {
        if (!repliesMap[reply.comment_id]) {
          repliesMap[reply.comment_id] = [];
        }
        repliesMap[reply.comment_id].push(reply as CommentReply);
      });
      
      setReplies(repliesMap);
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const handleReplyClick = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  const handleReplyAdded = async (commentId: string) => {
    // Refresh replies for this comment
    try {
      const { data, error } = await supabase
        .from("comment_replies")
        .select("*")
        .eq("comment_id", commentId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      setReplies(prev => ({
        ...prev,
        [commentId]: data as CommentReply[]
      }));
      
      // Close the reply form
      setReplyingTo(null);
    } catch (error) {
      console.error("Error fetching updated replies:", error);
    }
  };

  const initiateDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    
    setIsDeleting(true);
    
    try {
      // First, delete all replies for this comment
      const { error: repliesError } = await supabase
        .from("comment_replies")
        .delete()
        .eq("comment_id", commentToDelete);
      
      if (repliesError) {
        throw repliesError;
      }
      
      // Then delete the comment itself
      const { error: commentError } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentToDelete);
      
      if (commentError) {
        throw commentError;
      }
      
      // Update local state
      setComments(comments.filter(comment => comment.id !== commentToDelete));
      
      // Remove from replies map
      const newReplies = { ...replies };
      delete newReplies[commentToDelete];
      setReplies(newReplies);
      
      // Update total count
      setTotalCount(prev => prev - 1);
      
      toast.success("Comment and all replies deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

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
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Heart className="h-3.5 w-3.5 mr-1" />
                        <span>Like</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => handleReplyClick(comment.id)}
                      >
                        <Reply className="h-3.5 w-3.5 mr-1" />
                        <span>Reply</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-xs text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={() => initiateDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        <span>Delete</span>
                      </Button>
                    </div>
                    
                    {/* Replies section */}
                    {replies[comment.id] && replies[comment.id].length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-muted space-y-4">
                        {replies[comment.id].map(reply => (
                          <div key={reply.id} className="flex items-start gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-base font-medium flex-shrink-0",
                              reply.is_admin ? "bg-primary text-white" : "bg-muted"
                            )}>
                              {reply.is_admin ? 'A' : reply.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium flex items-center">
                                  {reply.name}
                                  {reply.is_admin && (
                                    <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                      Admin
                                    </span>
                                  )}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Reply form */}
                    {replyingTo === comment.id && (
                      <div className="mt-4 pl-4 border-l-2 border-muted">
                        <CommentReplyForm 
                          commentId={comment.id} 
                          onReplyAdded={() => handleReplyAdded(comment.id)}
                        />
                      </div>
                    )}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This will also remove all replies. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteComment} 
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Comments;

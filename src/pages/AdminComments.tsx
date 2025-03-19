
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, MessageSquare, Reply } from "lucide-react";
import { Comment, CommentReply } from "@/types/blog";

interface AdminComment extends Comment {
  article_title?: string;
  replies?: CommentReply[];
}

const AdminComments = () => {
  const { admin } = useAdmin();
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyingToComment, setReplyingToComment] = useState<AdminComment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    
    try {
      // Fetch all comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (commentsError) throw commentsError;
      
      // Get article information for each comment
      if (commentsData && commentsData.length > 0) {
        const articleIds = [...new Set(commentsData.map(comment => comment.article_id))];
        
        const { data: articlesData, error: articlesError } = await supabase
          .from("articles")
          .select("id, title")
          .in("id", articleIds);
          
        if (articlesError) throw articlesError;
        
        // Fetch replies for all comments
        const { data: repliesData, error: repliesError } = await supabase
          .from("comment_replies")
          .select("*")
          .in("comment_id", commentsData.map(comment => comment.id))
          .order("created_at", { ascending: true });
          
        if (repliesError) throw repliesError;
        
        // Map replies to comments
        const repliesByCommentId: Record<string, CommentReply[]> = {};
        repliesData?.forEach(reply => {
          if (!repliesByCommentId[reply.comment_id]) {
            repliesByCommentId[reply.comment_id] = [];
          }
          repliesByCommentId[reply.comment_id].push(reply as CommentReply);
        });
        
        // Create enhanced comments with article titles and replies
        const enhancedComments = commentsData.map(comment => {
          const article = articlesData?.find(article => article.id === comment.article_id);
          return {
            ...comment,
            article_title: article?.title || "Unknown Article",
            replies: repliesByCommentId[comment.id] || []
          };
        });
        
        setComments(enhancedComments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleReplyClick = (comment: AdminComment) => {
    setReplyingToComment(comment);
    setReplyContent("");
    setIsPasswordVerified(false);
    setAdminPassword("");
  };

  const verifyPassword = async () => {
    if (!admin) {
      toast.error("Admin not found");
      return false;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("username", admin.username)
        .eq("password", adminPassword)
        .single();
      
      if (error || !data) {
        toast.error("Incorrect password");
        return false;
      }
      
      setIsPasswordVerified(true);
      return true;
    } catch (error) {
      console.error("Error verifying password:", error);
      toast.error("Failed to verify password");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyingToComment || !replyContent.trim() || !admin) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from("comment_replies")
        .insert({
          comment_id: replyingToComment.id,
          name: admin.username,
          content: replyContent,
          is_admin: true,
          admin_username: admin.username
        });
      
      if (error) throw error;
      
      toast.success("Reply posted successfully");
      setReplyingToComment(null);
      setReplyContent("");
      setIsPasswordVerified(false);
      setAdminPassword("");
      
      // Refresh comments to show the new reply
      fetchComments();
    } catch (error) {
      console.error("Error posting admin reply:", error);
      toast.error("Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredComments = comments.filter(comment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      comment.name.toLowerCase().includes(searchLower) ||
      comment.email.toLowerCase().includes(searchLower) ||
      comment.content.toLowerCase().includes(searchLower) ||
      comment.article_title?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AdminLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Comments Management</h1>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-auto flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search comments..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-normal">
              Total: {comments.length}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchComments}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-center">
              <p className="text-muted-foreground">Loading comments...</p>
            </div>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-8 border rounded-lg">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-2" />
            <p className="text-muted-foreground">No comments found</p>
          </div>
        ) : (
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Comment</TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Replies</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {comment.content}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {comment.article_title}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{comment.name}</div>
                        <div className="text-xs text-muted-foreground">{comment.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {comment.replies?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleReplyClick(comment)}
                      >
                        <Reply className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Admin Reply Dialog */}
        {replyingToComment && (
          <Dialog open={!!replyingToComment} onOpenChange={(open) => !open && setReplyingToComment(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Admin Reply to Comment</DialogTitle>
              </DialogHeader>
              
              <div className="p-4 bg-muted/50 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium flex items-center gap-2">
                    {replyingToComment.name}
                    <span className="text-xs text-muted-foreground">
                      ({replyingToComment.email})
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(replyingToComment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{replyingToComment.content}</p>
              </div>
              
              {!isPasswordVerified ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Please enter your admin password to continue:
                  </p>
                  <Input
                    type="password"
                    placeholder="Admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                  <Button 
                    onClick={verifyPassword} 
                    disabled={!adminPassword || isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your reply as admin..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    onClick={handleSubmitReply}
                    disabled={!replyContent.trim() || isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? "Posting..." : "Post Admin Reply"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminComments;

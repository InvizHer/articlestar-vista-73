
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Search, MessageSquare, Reply, RefreshCw, Eye, Trash2 } from "lucide-react";
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
  const [selectedTab, setSelectedTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewCommentId, setViewCommentId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string>("all");
  const [articleOptions, setArticleOptions] = useState<{id: string, title: string}[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const fetchComments = async () => {
    setLoading(true);
    
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (commentsError) throw commentsError;
      
      if (commentsData && commentsData.length > 0) {
        const articleIds = [...new Set(commentsData.map(comment => comment.article_id))];
        
        const { data: articlesData, error: articlesError } = await supabase
          .from("articles")
          .select("id, title")
          .in("id", articleIds);
          
        if (articlesError) throw articlesError;
        
        setArticleOptions([
          { id: "all", title: "All Articles" },
          ...(articlesData || [])
        ]);
        
        const { data: repliesData, error: repliesError } = await supabase
          .from("comment_replies")
          .select("*")
          .in("comment_id", commentsData.map(comment => comment.id))
          .order("created_at", { ascending: true });
          
        if (repliesError) throw repliesError;
        
        const repliesByCommentId: Record<string, CommentReply[]> = {};
        repliesData?.forEach(reply => {
          if (!repliesByCommentId[reply.comment_id]) {
            repliesByCommentId[reply.comment_id] = [];
          }
          repliesByCommentId[reply.comment_id].push(reply as CommentReply);
        });
        
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

  const viewComment = (commentId: string) => {
    setViewCommentId(commentId);
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
      
      fetchComments();
    } catch (error) {
      console.error("Error posting admin reply:", error);
      toast.error("Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiateDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const deleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      setIsSubmitting(true);
      
      // First, delete all replies for this comment
      const { error: repliesError } = await supabase
        .from("comment_replies")
        .delete()
        .eq("comment_id", commentToDelete);
      
      if (repliesError) {
        console.error("Error deleting replies:", repliesError);
        throw repliesError;
      }
      
      // Then delete the comment itself
      const { error: commentError } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentToDelete);
        
      if (commentError) {
        console.error("Error deleting comment:", commentError);
        throw commentError;
      }
      
      toast.success("Comment deleted successfully");
      
      // Update local state
      setComments(prev => prev.filter(c => c.id !== commentToDelete));
      
      // Close view modal if open
      if (viewCommentId === commentToDelete) {
        setViewCommentId(null);
      }
      
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast.error(`Failed to delete comment: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  let filteredComments = comments.filter(comment => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      comment.name.toLowerCase().includes(searchLower) ||
      comment.email.toLowerCase().includes(searchLower) ||
      comment.content.toLowerCase().includes(searchLower) ||
      comment.article_title?.toLowerCase().includes(searchLower);
    
    const matchesTab = 
      selectedTab === "all" || 
      (selectedTab === "replied" && comment.replies && comment.replies.length > 0) ||
      (selectedTab === "unreplied" && (!comment.replies || comment.replies.length === 0));
    
    const matchesArticle = 
      selectedArticle === "all" || 
      comment.article_id === selectedArticle;
    
    return matchesSearch && matchesTab && matchesArticle;
  });

  if (sortBy === "newest") {
    filteredComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sortBy === "oldest") {
    filteredComments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (sortBy === "most-replies") {
    filteredComments.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0));
  }

  return (
    <DashboardLayout>
      <div className="container max-w-full px-4 md:px-6 py-6 animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Comments Management</h1>
          <p className="text-muted-foreground">View and respond to user comments across all articles</p>
        </div>
        
        <Tabs defaultValue="all" className="mb-6" onValueChange={setSelectedTab}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <TabsList className="mb-2 md:mb-0">
              <TabsTrigger value="all">All Comments</TabsTrigger>
              <TabsTrigger value="unreplied">Unreplied</TabsTrigger>
              <TabsTrigger value="replied">Replied</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search comments..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="most-replies">Most Replies</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedArticle} onValueChange={setSelectedArticle}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by article" />
                </SelectTrigger>
                <SelectContent>
                  {articleOptions.map(article => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={fetchComments}
                disabled={loading}
                title="Refresh comments"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="font-normal">
              {filteredComments.length} {filteredComments.length === 1 ? 'comment' : 'comments'} found
            </Badge>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {renderCommentsList(filteredComments)}
          </TabsContent>
          
          <TabsContent value="unreplied" className="mt-0">
            {renderCommentsList(filteredComments)}
          </TabsContent>
          
          <TabsContent value="replied" className="mt-0">
            {renderCommentsList(filteredComments)}
          </TabsContent>
        </Tabs>
        
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
                <div className="text-xs text-muted-foreground mt-2">
                  On article: {replyingToComment.article_title}
                </div>
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
        
        {viewCommentId && (
          <Dialog 
            open={!!viewCommentId} 
            onOpenChange={(open) => !open && setViewCommentId(null)}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Comment Details</DialogTitle>
              </DialogHeader>
              
              {(() => {
                const comment = comments.find(c => c.id === viewCommentId);
                if (!comment) return <p>Comment not found</p>;
                
                return (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{comment.name}</CardTitle>
                            <CardDescription>{comment.email}</CardDescription>
                          </div>
                          <Badge variant="outline">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          On article: {comment.article_title}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Replies ({comment.replies?.length || 0})</h4>
                      
                      {comment.replies && comment.replies.length > 0 ? (
                        <div className="space-y-2 pl-4 border-l-2 border-muted">
                          {comment.replies.map(reply => (
                            <Card key={reply.id} className="bg-muted/30">
                              <CardHeader className="py-2 px-3">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                      {reply.name}
                                      {reply.is_admin && (
                                        <Badge variant="default" className="ml-2 text-[10px] h-4">
                                          Admin
                                        </Badge>
                                      )}
                                    </span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                              </CardHeader>
                              <CardContent className="py-2 px-3">
                                <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No replies yet</p>
                      )}
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setViewCommentId(null)}
                      >
                        Close
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => {
                          setViewCommentId(null);
                          handleReplyClick(comment);
                        }}
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>
        )}
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="animate-scale-in">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this comment and all its replies. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={deleteComment} 
                disabled={isSubmitting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
  
  function renderCommentsList(comments: AdminComment[]) {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-center">
            <p className="text-muted-foreground">Loading comments...</p>
          </div>
        </div>
      );
    }
    
    if (comments.length === 0) {
      return (
        <div className="text-center py-8 border rounded-lg">
          <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-2" />
          <p className="text-muted-foreground">No comments found</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{comment.name}</CardTitle>
                  <CardDescription>{comment.email}</CardDescription>
                </div>
                <Badge variant="outline">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-0">
              <p className="line-clamp-3 text-sm">{comment.content}</p>
              <p className="text-xs text-muted-foreground mt-2 truncate">
                Article: {comment.article_title}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between pt-4 pb-4">
              <Badge variant={comment.replies?.length ? "secondary" : "outline"}>
                {comment.replies?.length || 0} Replies
              </Badge>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => viewComment(comment.id)}
                  title="View comment"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleReplyClick(comment)}
                  title="Reply to comment"
                >
                  <Reply className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => initiateDeleteComment(comment.id)}
                  className="text-destructive hover:text-destructive"
                  title="Delete comment"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
};

export default AdminComments;

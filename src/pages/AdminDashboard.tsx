
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  BarChart3, 
  FileText, 
  Eye, 
  MessageSquare,
  ArrowUpRight, 
  PenTool,
  Users,
  ChevronRight,
  CalendarDays,
  Loader2,
  Send,
  Newspaper,
  Settings,
  FileQuestion,
  HelpCircle
} from "lucide-react";
import { Article } from "@/types/blog";
import { Link } from "react-router-dom";
import { DbArticle } from "@/types/database";
import { formatDistanceToNow, format } from "date-fns";
import { useAdmin } from "@/context/AdminContext";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const AdminDashboard = () => {
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [articleCount, setArticleCount] = useState({ total: 0, published: 0, draft: 0 });
  const [commentStats, setCommentStats] = useState({ total: 0, replied: 0, unreplied: 0 });
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const { admin } = useAdmin();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch latest articles
        const { data: articles, error: articlesError } = await supabase
          .from("articles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);
          
        if (articlesError) throw articlesError;
        
        // Fetch article counts
        const { count: totalCount, error: totalError } = await supabase
          .from("articles")
          .select("*", { count: "exact", head: true });
          
        const { count: publishedCount, error: publishedError } = await supabase
          .from("articles")
          .select("*", { count: "exact", head: true })
          .eq("published", true);
          
        if (totalError || publishedError) throw totalError || publishedError;
        
        // Fetch comment counts
        const { data: comments, error: commentsError } = await supabase
          .from("unified_comments")
          .select("id");
          
        if (commentsError) throw commentsError;
        
        // Get replied comments count (simplified for now - will be updated later)
        const repliedCount = 0; // Placeholder

        // Calculate total views
        let views = 0;
        if (articles) {
          views = articles.reduce((sum, article) => sum + (article.view_count || 0), 0);
        }
        
        // Transform DB articles to frontend Article type
        const transformedArticles = articles?.map((article: DbArticle) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          author: {
            name: article.author_name,
            avatar: article.author_avatar || "/placeholder.svg",
          },
          date: article.date,
          readTime: article.read_time,
          category: article.category,
          tags: article.tags,
          coverImage: article.cover_image || "/placeholder.svg",
          published: article.published,
          viewCount: article.view_count || 0,
        })) || [];
        
        setRecentArticles(transformedArticles);
        setArticleCount({
          total: totalCount || 0,
          published: publishedCount || 0,
          draft: (totalCount || 0) - (publishedCount || 0),
        });
        setCommentStats({
          total: comments?.length || 0,
          replied: repliedCount,
          unreplied: (comments?.length || 0) - repliedCount
        });
        setTotalViews(views);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, <span className="text-primary">{admin?.username || "Admin"}</span>!
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your blog today
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="shadow-sm">
                <Link to="/admin/articles" className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4" />
                  Articles
                </Link>
              </Button>
              <Button asChild className="shadow-sm">
                <Link to="/admin/article/new" className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  New Article
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Articles Card */}
              <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Articles</CardTitle>
                  <div className="p-2 bg-blue-50 rounded-md dark:bg-blue-900/30">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {articleCount.total.toLocaleString()}
                    </div>
                  )}
                  <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
                    {loading ? (
                      <Skeleton className="h-4 w-40" />
                    ) : (
                      <>
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700/30">
                          {articleCount.published.toLocaleString()} published
                        </Badge>
                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700/30">
                          {articleCount.draft.toLocaleString()} drafts
                        </Badge>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Total Views Card */}
              <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <div className="p-2 bg-green-50 rounded-md dark:bg-green-900/30">
                    <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {totalViews.toLocaleString()}
                    </div>
                  )}
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    Across all articles
                  </div>
                </CardContent>
              </Card>
              
              {/* Comments Card */}
              <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Comments</CardTitle>
                  <div className="p-2 bg-purple-50 rounded-md dark:bg-purple-900/30">
                    <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {commentStats.total.toLocaleString()}
                    </div>
                  )}
                  {loading ? (
                    <Skeleton className="h-4 w-full mt-2" />
                  ) : (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Replied</span>
                        <span className="font-medium">{commentStats.replied}/{commentStats.total}</span>
                      </div>
                      <Progress 
                        value={commentStats.total ? (commentStats.replied / commentStats.total) * 100 : 0} 
                        className="h-1.5" 
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Last Update Card */}
              <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
                  <div className="p-2 bg-amber-50 rounded-md dark:bg-amber-900/30">
                    <CalendarDays className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {recentArticles.length > 0 
                        ? formatDistanceToNow(new Date(recentArticles[0].date), { addSuffix: true }) 
                        : "No activity"}
                    </div>
                  )}
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {recentArticles.length > 0 
                      ? `Last article: ${recentArticles[0].title.substring(0, 20)}...` 
                      : "No articles yet"}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Articles */}
              <Card className="lg:col-span-2 border shadow-sm">
                <CardHeader>
                  <CardTitle>Recent Articles</CardTitle>
                  <CardDescription>
                    Your most recently created or updated articles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array(3).fill(null).map((_, i) => (
                        <div key={i} className="flex gap-4 items-center p-3 border rounded-lg">
                          <Skeleton className="h-12 w-12 rounded-md" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentArticles.length > 0 ? (
                    <div className="space-y-3">
                      {recentArticles.slice(0, 3).map((article) => (
                        <Link 
                          key={article.id} 
                          to={`/admin/article/${article.id}`}
                          className="flex gap-4 items-center p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border">
                            <img 
                              src={article.coverImage} 
                              alt={article.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 className="font-medium text-sm line-clamp-1">{article.title}</h3>
                              <Badge variant={article.published ? "default" : "outline"} className="ml-2 text-xs">
                                {article.published ? "Published" : "Draft"}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {formatDistanceToNow(new Date(article.date), { addSuffix: true })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {article.viewCount} views
                              </span>
                            </div>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <p className="mb-4">No articles found</p>
                      <Button asChild>
                        <Link to="/admin/article/new" className="flex items-center gap-2">
                          <PenTool className="h-4 w-4" />
                          Create Your First Article
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button variant="outline" asChild className="ml-auto">
                    <Link to="/admin/articles">
                      View All Articles
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Quick Help */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>Admin Help</CardTitle>
                  <CardDescription>
                    Quick tips and resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                          <FileQuestion className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-medium text-sm">Creating Content</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Use the Article Editor to create engaging content with rich text formatting, images, and more.
                      </p>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                          <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="font-medium text-sm">Managing Comments</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Respond to reader comments to build engagement and community around your content.
                      </p>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                          <Settings className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-medium text-sm">Admin Settings</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Customize your blog's appearance, manage users, and configure site settings.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground flex items-center gap-1.5 ml-auto" asChild>
                    <Link to="/admin/settings">
                      <HelpCircle className="h-3.5 w-3.5" />
                      View Admin Guide
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            {/* Recent Articles */}
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>All Articles</CardTitle>
                  <CardDescription>
                    Manage your published and draft articles
                  </CardDescription>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin/articles" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    All Articles
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array(5).fill(null).map((_, i) => (
                      <div key={i} className="flex gap-4 items-center p-3 border rounded-lg">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentArticles.length > 0 ? (
                  <div className="space-y-3">
                    {recentArticles.map((article) => (
                      <Link 
                        key={article.id} 
                        to={`/admin/article/${article.id}`}
                        className="flex gap-4 items-center p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border">
                          <img 
                            src={article.coverImage} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium text-sm line-clamp-1">{article.title}</h3>
                            <Badge variant={article.published ? "default" : "outline"} className="ml-2 text-xs">
                              {article.published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {format(new Date(article.date), "MMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {article.viewCount} views
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <p className="mb-4">No articles found</p>
                    <Button asChild>
                      <Link to="/admin/article/new" className="flex items-center gap-2">
                        <PenTool className="h-4 w-4" />
                        Create Your First Article
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t px-6 py-4 flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {recentArticles.length} of {articleCount.total} articles
                </div>
                <Button variant="outline" asChild>
                  <Link to="/admin/articles">
                    View All Articles
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Quick Actions */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" asChild className="h-auto py-6 flex flex-col items-center justify-center gap-3">
                    <Link to="/admin/article/new">
                      <PenTool className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <span>New Article</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="h-auto py-6 flex flex-col items-center justify-center gap-3">
                    <Link to="/admin/comments">
                      <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <span>Comments</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="h-auto py-6 flex flex-col items-center justify-center gap-3">
                    <Link to="/admin/articles">
                      <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      <span>All Articles</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="h-auto py-6 flex flex-col items-center justify-center gap-3">
                    <Link to="/">
                      <Send className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      <span>View Site</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

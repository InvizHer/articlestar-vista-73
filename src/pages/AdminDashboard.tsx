
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
  TrendingUp, 
  Clock,
  ArrowUpRight, 
  PenTool,
  Users,
  ChevronRight,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Loader2,
  Send,
  Newspaper
} from "lucide-react";
import { Article } from "@/types/blog";
import { Link } from "react-router-dom";
import { DbArticle } from "@/types/database";
import { formatDistanceToNow } from "date-fns";
import { useAdmin } from "@/context/AdminContext";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const AdminDashboard = () => {
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [articleCount, setArticleCount] = useState({ total: 0, published: 0, draft: 0 });
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const { admin } = useAdmin();
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data for line chart
  const viewsData = [
    { name: "Jan", views: 450 },
    { name: "Feb", views: 620 },
    { name: "Mar", views: 580 },
    { name: "Apr", views: 730 },
    { name: "May", views: 820 },
    { name: "Jun", views: 990 },
    { name: "Jul", views: 1100 },
  ];

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
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
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
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {/* Total Articles Card */}
              <motion.div variants={item}>
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
              </motion.div>
              
              {/* Total Views Card */}
              <motion.div variants={item}>
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
                    <div className="flex items-center text-xs text-green-600 mt-1">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      <span>12% increase this month</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Reading Time Card */}
              <motion.div variants={item}>
                <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Reading Time</CardTitle>
                    <div className="p-2 bg-purple-50 rounded-md dark:bg-purple-900/30">
                      <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <div className="text-2xl font-bold">
                        4.2 <span className="text-sm font-normal text-muted-foreground">min</span>
                      </div>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      Based on all published articles
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Engagement Card */}
              <motion.div variants={item}>
                <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Popular Category</CardTitle>
                    <div className="p-2 bg-amber-50 rounded-md dark:bg-amber-900/30">
                      <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <div className="text-2xl font-bold">
                        {recentArticles.length > 0 ? recentArticles[0].category : "Technology"}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-amber-600 mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>Trending this week</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
            
            {/* Chart & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart Card */}
              <Card className="lg:col-span-2 border shadow-sm">
                <CardHeader>
                  <CardTitle>Views Overview</CardTitle>
                  <CardDescription>
                    Total views across all articles in the past 7 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={viewsData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="name" 
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12 }}
                          width={30}
                        />
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#eee" />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            border: '1px solid #eee',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="views" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#viewsGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button variant="outline" asChild className="ml-auto">
                    <Link to="/admin/analytics">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Analytics
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Recent Activity */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates and actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array(4).fill(null).map((_, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-3 items-start">
                        <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30">
                          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">New article published</p>
                          <p className="text-xs text-muted-foreground">
                            {recentArticles.length > 0 ? (
                              <>{formatDistanceToNow(new Date(recentArticles[0].date), { addSuffix: true })}</>
                            ) : "2 hours ago"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 items-start">
                        <div className="p-2 rounded-full bg-green-50 dark:bg-green-900/30">
                          <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Article reached 1,000 views</p>
                          <p className="text-xs text-muted-foreground">Yesterday</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 items-start">
                        <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-900/30">
                          <PenTool className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Draft saved</p>
                          <p className="text-xs text-muted-foreground">3 days ago</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 items-start">
                        <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-900/30">
                          <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">New author added</p>
                          <p className="text-xs text-muted-foreground">1 week ago</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button variant="ghost" size="sm" className="ml-auto">
                    <span className="text-xs text-muted-foreground">View all activity</span>
                    <ChevronRight className="ml-1 h-4 w-4" />
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
                  <CardTitle>Recent Articles</CardTitle>
                  <CardDescription>
                    Your most recently created articles
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
                    <Link to="/admin/analytics">
                      <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <span>Analytics</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="h-auto py-6 flex flex-col items-center justify-center gap-3">
                    <Link to="/admin/articles">
                      <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      <span>Manage Articles</span>
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

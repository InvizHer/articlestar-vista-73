
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart, 
  FileText, 
  Eye, 
  TrendingUp, 
  Clock,
  ArrowUpRight 
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

const AdminDashboard = () => {
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [articleCount, setArticleCount] = useState({ total: 0, published: 0, draft: 0 });
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const { admin } = useAdmin();

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {admin?.username || "Admin"}!</p>
          </div>
          <Button asChild>
            <Link to="/admin/article/new" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              New Article
            </Link>
          </Button>
        </div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">
                    {articleCount.total.toLocaleString()}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      articles
                    </span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {loading ? (
                    <Skeleton className="h-4 w-40" />
                  ) : (
                    <>
                      <span className="text-green-500 font-medium">
                        {articleCount.published.toLocaleString()}
                      </span> published, 
                      <span className="text-orange-500 font-medium ml-1">
                        {articleCount.draft.toLocaleString()}
                      </span> drafts
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">
                    {totalViews.toLocaleString()}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      views
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-36" />
                ) : (
                  <div className="text-2xl font-bold">
                    {recentArticles.length > 0 ? 
                      formatDistanceToNow(new Date(recentArticles[0].date), { addSuffix: true }) :
                      "No recent activity"
                    }
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {loading ? (
                    <Skeleton className="h-4 w-40" />
                  ) : (
                    recentArticles.length > 0 && `Last article: ${recentArticles[0].title.substring(0, 20)}...`
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
            <CardDescription>
              Your most recently created and updated articles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recent" className="space-y-4">
              <TabsList>
                <TabsTrigger value="recent">Recently Created</TabsTrigger>
                <TabsTrigger value="views">Most Viewed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recent" className="space-y-4">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-md">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-60" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  ))
                ) : recentArticles.length > 0 ? (
                  recentArticles.map((article) => (
                    <Link 
                      key={article.id} 
                      to={`/admin/article/${article.id}`}
                      className="flex items-center gap-4 p-4 border rounded-md hover:bg-accent/10 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src={article.coverImage} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm line-clamp-1">{article.title}</h3>
                          <Badge variant={article.published ? "default" : "outline"} className="ml-2">
                            {article.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(article.date), { addSuffix: true })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.viewCount} views
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No articles found. Create your first article!
                  </div>
                )}
                
                {recentArticles.length > 0 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" asChild>
                      <Link to="/admin/articles">View All Articles</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="views" className="space-y-4">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-md">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-60" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  ))
                ) : recentArticles.length > 0 ? (
                  [...recentArticles]
                    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                    .map((article) => (
                      <Link 
                        key={article.id} 
                        to={`/admin/article/${article.id}`}
                        className="flex items-center gap-4 p-4 border rounded-md hover:bg-accent/10 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={article.coverImage} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm line-clamp-1">{article.title}</h3>
                            <Badge variant={article.published ? "default" : "outline"} className="ml-2">
                              {article.published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(article.date), { addSuffix: true })}
                            </span>
                            <span className="flex items-center gap-1 font-medium text-green-500">
                              <Eye className="h-3 w-3" />
                              {article.viewCount} views
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No articles found. Create your first article!
                  </div>
                )}
                
                {recentArticles.length > 0 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" asChild>
                      <Link to="/admin/analytics">View Analytics</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

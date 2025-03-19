
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Eye,
  Heart,
  TrendingUp,
  FileText,
  BarChart as BarChartIcon,
  RefreshCw,
  Calendar,
  CircleCheck,
  CircleOff,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { Article } from "@/types/blog";

interface ArticleAnalytics {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
  likesCount: number;
  published: boolean;
  date: string;
}

const AdminAnalytics = () => {
  const [articles, setArticles] = useState<ArticleAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "all">("30days");
  const [totalViews, setTotalViews] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [mostViewedArticle, setMostViewedArticle] = useState<ArticleAnalytics | null>(null);
  const [mostLikedArticle, setMostLikedArticle] = useState<ArticleAnalytics | null>(null);
  const [recentArticle, setRecentArticle] = useState<ArticleAnalytics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const { data: articlesData, error } = await supabase
        .from("articles")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;

      if (!articlesData || articlesData.length === 0) {
        setLoading(false);
        return;
      }

      // Process article data and get likes counts
      const processedArticles: ArticleAnalytics[] = [];
      let views = 0;
      let likes = 0;
      let published = 0;
      let drafts = 0;

      for (const article of articlesData) {
        // Get likes count for each article
        const { data: likesData, error: likesError } = await supabase
          .rpc('get_like_count', { p_article_id: article.id });

        if (likesError) console.error("Error fetching likes count:", likesError);

        // Check if article is within selected time range
        const articleDate = new Date(article.date);
        let inTimeRange = true;

        if (timeRange === "7days") {
          inTimeRange = articleDate >= subDays(new Date(), 7);
        } else if (timeRange === "30days") {
          inTimeRange = articleDate >= subDays(new Date(), 30);
        }

        if (inTimeRange) {
          const likesCount = likesData || 0;
          
          const processedArticle: ArticleAnalytics = {
            id: article.id,
            title: article.title,
            slug: article.slug,
            viewCount: article.view_count || 0,
            likesCount: likesCount,
            published: article.published,
            date: article.date,
          };

          processedArticles.push(processedArticle);
          
          // Update counters
          views += article.view_count || 0;
          likes += likesCount;
          
          if (article.published) {
            published++;
          } else {
            drafts++;
          }
        }
      }

      setArticles(processedArticles);
      setTotalViews(views);
      setTotalLikes(likes);
      setPublishedCount(published);
      setDraftCount(drafts);

      // Find most viewed article
      const sortedByViews = [...processedArticles].sort((a, b) => b.viewCount - a.viewCount);
      setMostViewedArticle(sortedByViews.length > 0 ? sortedByViews[0] : null);

      // Find most liked article
      const sortedByLikes = [...processedArticles].sort((a, b) => b.likesCount - a.likesCount);
      setMostLikedArticle(sortedByLikes.length > 0 ? sortedByLikes[0] : null);

      // Most recent article
      const sortedByDate = [...processedArticles].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecentArticle(sortedByDate.length > 0 ? sortedByDate[0] : null);

    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const prepareViewsAndLikesChart = () => {
    return articles
      .filter((a) => a.published)
      .slice(0, 5)
      .map((article) => ({
        name: article.title.length > 20 ? article.title.substring(0, 20) + "..." : article.title,
        views: article.viewCount,
        likes: article.likesCount,
      }));
  };

  const prepareCategoryDistribution = () => {
    const categories: Record<string, number> = {};
    
    articles.forEach((article) => {
      const category = "category" in article ? (article as any).category : "Uncategorized";
      if (categories[category]) {
        categories[category]++;
      } else {
        categories[category] = 1;
      }
    });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  // Animation variants for fade-in effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Insights from your blog performance</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-2">
            <Tabs defaultValue={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
              <TabsList>
                <TabsTrigger value="7days">7 Days</TabsTrigger>
                <TabsTrigger value="30days">30 Days</TabsTrigger>
                <TabsTrigger value="all">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchAnalytics}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    <h3 className="text-2xl font-bold mt-1">{totalViews}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Eye className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                    <h3 className="text-2xl font-bold mt-1">{totalLikes}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    <Heart className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Published</p>
                    <h3 className="text-2xl font-bold mt-1">{publishedCount}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <CircleCheck className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                    <h3 className="text-2xl font-bold mt-1">{draftCount}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                    <CircleOff className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top Performing Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" /> Most Viewed Article
                </CardTitle>
                <CardDescription>
                  The article with the highest number of views
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mostViewedArticle ? (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg line-clamp-1">{mostViewedArticle.title}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span>{mostViewedArticle.viewCount} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{format(new Date(mostViewedArticle.date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full mt-2">
                      <Link to={`/admin/article/${mostViewedArticle.id}`}>View Details</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No published articles found
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" /> Most Liked Article
                </CardTitle>
                <CardDescription>
                  The article with the highest number of likes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mostLikedArticle ? (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg line-clamp-1">{mostLikedArticle.title}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>{mostLikedArticle.likesCount} likes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{format(new Date(mostLikedArticle.date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full mt-2">
                      <Link to={`/admin/article/${mostLikedArticle.id}`}>View Details</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No published articles found
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChartIcon className="h-5 w-5" /> Top Articles Performance
              </CardTitle>
              <CardDescription>
                Views and likes comparison for top performing articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {articles.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareViewsAndLikesChart()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="views" fill="#0088FE" name="Views" />
                      <Bar dataKey="likes" fill="#FF8042" name="Likes" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Articles Performance */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Articles Performance
              </CardTitle>
              <CardDescription>
                Performance metrics for your articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-2">Title</th>
                      <th className="text-center pb-2">Views</th>
                      <th className="text-center pb-2">Likes</th>
                      <th className="text-center pb-2">Engagement</th>
                      <th className="text-right pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.length > 0 ? (
                      articles.slice(0, 5).map((article) => (
                        <tr key={article.id} className="border-b hover:bg-muted/30">
                          <td className="py-3 pr-4">
                            <Link
                              to={`/admin/article/${article.id}`}
                              className="font-medium hover:text-primary line-clamp-1"
                            >
                              {article.title}
                            </Link>
                          </td>
                          <td className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Eye className="h-3.5 w-3.5 text-blue-500" />
                              {article.viewCount}
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Heart className="h-3.5 w-3.5 text-red-500" />
                              {article.likesCount}
                            </div>
                          </td>
                          <td className="text-center">
                            <div title="Likes per view">
                              {article.viewCount > 0
                                ? `${((article.likesCount / article.viewCount) * 100).toFixed(1)}%`
                                : "0%"}
                            </div>
                          </td>
                          <td className="text-right">
                            {format(new Date(article.date), "MMM d, yyyy")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-muted-foreground">
                          No articles found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {articles.length > 5 && (
                <div className="mt-4 text-center">
                  <Button asChild variant="outline">
                    <Link to="/admin/articles">View All Articles</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;


import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Users,
  Eye,
  ChevronRight,
  Loader2,
  Calendar,
  Search,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Article } from "@/types/blog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DbArticle } from "@/types/database";

// Sample data for demonstration
const generateSampleData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  return months.slice(0, currentMonth + 1).map((month, index) => ({
    name: month,
    views: Math.floor(Math.random() * 5000) + 500,
    users: Math.floor(Math.random() * 3000) + 200,
    articles: Math.floor(Math.random() * 10) + 1
  }));
};

const visitorData = generateSampleData();

const deviceData = [
  { name: 'Mobile', value: 58 },
  { name: 'Desktop', value: 32 },
  { name: 'Tablet', value: 10 },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff8e8e'];

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [articleData, setArticleData] = useState<Article[]>([]);
  const [topArticles, setTopArticles] = useState<Article[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<{ name: string; views: number; articles: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("all");
  
  useEffect(() => {
    fetchArticleData();
  }, []);
  
  const fetchArticleData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("view_count", { ascending: false });
        
      if (error) throw error;
      
      // Transform data
      const transformedArticles = data?.map((article: DbArticle) => ({
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
      
      setArticleData(transformedArticles);
      setTopArticles(transformedArticles.slice(0, 5));
      
      // Aggregate category data
      const categories = transformedArticles.reduce((acc: Record<string, { views: number, articles: number }>, article) => {
        const { category, viewCount } = article;
        if (category) {
          if (!acc[category]) {
            acc[category] = { views: 0, articles: 0 };
          }
          acc[category].views += viewCount || 0;
          acc[category].articles += 1;
        }
        return acc;
      }, {});
      
      const categoryData = Object.entries(categories).map(([name, data]) => ({
        name,
        views: data.views,
        articles: data.articles
      }))
      .sort((a, b) => b.views - a.views);
      
      setCategoryPerformance(categoryData);
      
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Calculate total views
  const totalViews = articleData.reduce((sum, article) => sum + (article.viewCount || 0), 0);
  
  // Calculate total articles
  const totalArticles = articleData.length;
  
  // Calculate published articles
  const publishedArticles = articleData.filter(article => article.published).length;
  
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
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg">Loading analytics data...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-2 sm:px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your content performance and audience insights</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Info className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </div>
        
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Overview Cards */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-gray-100 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Views</p>
                    <h3 className="text-2xl font-bold">{formatNumber(totalViews)}</h3>
                    <div className="flex items-center mt-1 text-green-500 text-xs font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>12% from last month</span>
                    </div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-gray-100 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Unique Visitors</p>
                    <h3 className="text-2xl font-bold">{formatNumber(totalViews * 0.7)}</h3>
                    <div className="flex items-center mt-1 text-green-500 text-xs font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>8% from last month</span>
                    </div>
                  </div>
                  <div className="bg-indigo-500/10 p-3 rounded-full">
                    <Users className="h-5 w-5 text-indigo-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-gray-100 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Articles Published</p>
                    <h3 className="text-2xl font-bold">{publishedArticles}</h3>
                    <div className="flex items-center mt-1 text-muted-foreground text-xs font-medium">
                      <span>out of {totalArticles} total</span>
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 p-3 rounded-full">
                    <BarChart2 className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-gray-100 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Read Time</p>
                    <h3 className="text-2xl font-bold">2.5 min</h3>
                    <div className="flex items-center mt-1 text-red-500 text-xs font-medium">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      <span>3% from last month</span>
                    </div>
                  </div>
                  <div className="bg-amber-500/10 p-3 rounded-full">
                    <LineChartIcon className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Main Charts Section */}
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visitor Trends */}
            <Card className="lg:col-span-2 border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Visitor Trends</CardTitle>
                <CardDescription>Monthly view and user statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={visitorData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: '1px solid rgba(0,0,0,0.1)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="views" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Device Distribution */}
            <Card className="border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Device Distribution</CardTitle>
                <CardDescription>Visitor device breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <Tabs defaultValue="articles" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="articles" className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Article Performance
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4" />
                  Category Insights
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="articles" className="space-y-6">
                <Card className="border-gray-100 dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <CardTitle className="text-lg">Top Performing Articles</CardTitle>
                        <CardDescription>Articles with the highest view counts</CardDescription>
                      </div>
                      <div className="relative w-full sm:w-auto max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search articles..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {topArticles
                          .filter(article => article.title.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((article, index) => (
                            <div 
                              key={article.id} 
                              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="hidden sm:block w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
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
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                  <h3 className="font-medium truncate text-base">{article.title}</h3>
                                  <Badge variant="outline" className="sm:ml-2 w-fit">
                                    {article.category || "Uncategorized"}
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>{formatNumber(article.viewCount || 0)} views</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{formatDate(article.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>By {article.author.name}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <Button variant="ghost" size="sm" className="ml-auto flex-shrink-0" asChild>
                                <a href={`/admin/article/${article.id}`}>
                                  <span className="hidden sm:inline mr-1">Details</span>
                                  <ChevronRight className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
                
                <Card className="border-gray-100 dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Content Performance</CardTitle>
                    <CardDescription>Article views comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topArticles.slice(0, 10).map(article => ({
                            name: article.title.length > 20 ? article.title.substring(0, 20) + '...' : article.title,
                            views: article.viewCount || 0
                          }))}
                          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end"
                            tick={{ fontSize: 12 }}
                            height={70}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="views" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="categories" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-gray-100 dark:border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Top Performing Categories</CardTitle>
                      <CardDescription>Categories by total views</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryPerformance.slice(0, 5)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="views"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {categoryPerformance.slice(0, 5).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-gray-100 dark:border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Category Analytics</CardTitle>
                      <CardDescription>Views and article count by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-80 pr-4">
                        <div className="space-y-4">
                          {categoryPerformance.map((category, index) => (
                            <div 
                              key={index} 
                              className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">{category.name}</h3>
                                <Badge variant="outline">{category.articles} articles</Badge>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Total Views</span>
                                <span className="font-medium">{formatNumber(category.views)}</span>
                              </div>
                              
                              <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${Math.min(100, (category.views / (categoryPerformance[0]?.views || 1)) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="border-gray-100 dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Category Performance</CardTitle>
                    <CardDescription>Views by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={categoryPerformance.slice(0, 8)}
                          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end"
                            tick={{ fontSize: 12 }}
                            height={70}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="views" fill="#8884d8" name="Views" />
                          <Bar dataKey="articles" fill="#82ca9d" name="Articles" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;

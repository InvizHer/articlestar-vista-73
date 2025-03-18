
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Article } from "@/types/blog";
import { DbArticle } from "@/types/database";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Eye,
  Clock,
  Award,
  Filter,
  Calendar,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  FileText,
  BookOpen,
  ListFilter,
  Activity
} from "lucide-react";
import { ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, Cell, Pie, Sector } from "recharts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface CategoryStat {
  name: string;
  count: number;
  views: number;
}

const COLORS = ['#8B5CF6', '#EC4899', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#A855F7'];

const CustomizedAxisTick = (props: any) => {
  const { x, y, payload } = props;
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} 
        y={0} 
        dy={16} 
        textAnchor="end" 
        fill="#666"
        transform="rotate(-35)"
        fontSize="12px"
      >
        {payload.value}
      </text>
    </g>
  );
};

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value} articles`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const AdminAnalytics = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sortBy, setSortBy] = useState<"views" | "date">("views");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch all articles
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        // Transform DB articles to frontend Article type
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
        
        setArticles(transformedArticles);
        
        // Create category statistics
        const categories: Record<string, CategoryStat> = {};
        transformedArticles.forEach(article => {
          const category = article.category || "Uncategorized";
          if (!categories[category]) {
            categories[category] = { name: category, count: 0, views: 0 };
          }
          categories[category].count += 1;
          categories[category].views += article.viewCount || 0;
        });
        
        setCategoryStats(Object.values(categories));
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, []);
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const sortedByViews = [...articles].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  const sortedByDate = [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const displayedArticles = sortBy === "views" ? sortedByViews : sortedByDate;
  
  // Stats
  const totalArticles = articles.length;
  const publishedArticles = articles.filter(a => a.published).length;
  const totalViews = articles.reduce((sum, article) => sum + (article.viewCount || 0), 0);
  const avgViewsPerArticle = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-1">Get insights about your content performance</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-white dark:bg-gray-800 shadow-sm">
                  <ListFilter className="h-4 w-4" />
                  Sort by: {sortBy === "views" ? "Views" : "Date"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("views")}>
                  <Eye className="h-4 w-4 mr-2" />
                  Sort by Views
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("date")}>
                  <Clock className="h-4 w-4 mr-2" />
                  Sort by Date
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
                  <h3 className="text-3xl font-bold mt-1">{totalArticles}</h3>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <span className="flex items-center">
                  {publishedArticles} published
                </span>
                <span className="mx-2">•</span>
                <span>
                  {totalArticles - publishedArticles} drafts
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <h3 className="text-3xl font-bold mt-1">{totalViews.toLocaleString()}</h3>
                </div>
                <div className="bg-green-500/10 p-2 rounded-full">
                  <Eye className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
                <span>
                  {avgViewsPerArticle} avg. views per article
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <h3 className="text-3xl font-bold mt-1">{categoryStats.length}</h3>
                </div>
                <div className="bg-purple-500/10 p-2 rounded-full">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                {categoryStats.length > 0 && (
                  <>
                    <span>Most articles: </span>
                    <Badge variant="outline" className="ml-1 font-normal">
                      {categoryStats.sort((a, b) => b.count - a.count)[0]?.name}
                    </Badge>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Top Article</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {sortedByViews[0]?.viewCount || 0}
                    <span className="text-sm font-medium text-muted-foreground ml-1">views</span>
                  </h3>
                </div>
                <div className="bg-amber-500/10 p-2 rounded-full">
                  <Award className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground truncate">
                {sortedByViews[0]?.title || "No articles yet"}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm bg-white dark:bg-gray-800">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Top Articles by Views
              </CardTitle>
              <CardDescription>
                Performance of your most viewed articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[350px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : articles.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sortedByViews.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <XAxis 
                        dataKey="title" 
                        tick={<CustomizedAxisTick />}
                        height={60}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [`${value} views`, 'Views']}
                        labelFormatter={(label) => `${label}`}
                        contentStyle={{ borderRadius: '8px' }}
                      />
                      <Bar dataKey="viewCount" name="Views" radius={[4, 4, 0, 0]}>
                        {sortedByViews.slice(0, 10).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-sm bg-white dark:bg-gray-800">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Articles by Category
              </CardTitle>
              <CardDescription>
                Distribution across categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[350px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : categoryStats.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={categoryStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        onMouseEnter={onPieEnter}
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Articles Table */}
        <Card className="shadow-sm bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Article Performance
            </CardTitle>
            <CardDescription>
              Complete overview of all your articles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex bg-muted/80 p-1 rounded-lg mb-6">
                <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  All Articles
                </TabsTrigger>
                <TabsTrigger value="published" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  Published
                </TabsTrigger>
                <TabsTrigger value="drafts" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  Drafts
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4 mt-0">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <div className="bg-muted/50 px-4 py-3 grid grid-cols-12 text-sm font-medium">
                      <div className="col-span-7 sm:col-span-6 lg:col-span-5">Title</div>
                      <div className="hidden sm:block sm:col-span-2">Category</div>
                      <div className="col-span-3 sm:col-span-2">Status</div>
                      <div className="hidden lg:block lg:col-span-2">Date</div>
                      <div className="col-span-2 sm:col-span-2 lg:col-span-1 text-right">Views</div>
                    </div>
                    <div className="divide-y">
                      {displayedArticles.map((article) => (
                        <Link
                          key={article.id}
                          to={`/admin/article/${article.id}`}
                          className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="col-span-7 sm:col-span-6 lg:col-span-5 flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded overflow-hidden shrink-0">
                              <img 
                                src={article.coverImage} 
                                alt={article.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                            </div>
                            <span className="font-medium truncate">{article.title}</span>
                          </div>
                          <div className="hidden sm:block sm:col-span-2 truncate">
                            <Badge variant="outline" className="truncate max-w-full">
                              {article.category || "Uncategorized"}
                            </Badge>
                          </div>
                          <div className="col-span-3 sm:col-span-2">
                            <Badge variant={article.published ? "default" : "outline"} className="w-full text-center justify-center sm:w-auto sm:justify-start">
                              {article.published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <div className="hidden lg:block lg:col-span-2 text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(article.date), { addSuffix: true })}
                          </div>
                          <div className={cn(
                            "col-span-2 sm:col-span-2 lg:col-span-1 text-right font-medium", 
                            article.viewCount && article.viewCount > 10 ? "text-green-500" : ""
                          )}>
                            {article.viewCount || 0}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="published" className="space-y-4 mt-0">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <div className="bg-muted/50 px-4 py-3 grid grid-cols-12 text-sm font-medium">
                      <div className="col-span-7 sm:col-span-6 lg:col-span-5">Title</div>
                      <div className="hidden sm:block sm:col-span-2">Category</div>
                      <div className="col-span-3 sm:col-span-2">Status</div>
                      <div className="hidden lg:block lg:col-span-2">Date</div>
                      <div className="col-span-2 sm:col-span-2 lg:col-span-1 text-right">Views</div>
                    </div>
                    <div className="divide-y">
                      {displayedArticles
                        .filter(article => article.published)
                        .map((article) => (
                          <Link
                            key={article.id}
                            to={`/admin/article/${article.id}`}
                            className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/30 transition-colors"
                          >
                            <div className="col-span-7 sm:col-span-6 lg:col-span-5 flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded overflow-hidden shrink-0">
                                <img 
                                  src={article.coverImage} 
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                  }}
                                />
                              </div>
                              <span className="font-medium truncate">{article.title}</span>
                            </div>
                            <div className="hidden sm:block sm:col-span-2 truncate">
                              <Badge variant="outline" className="truncate max-w-full">
                                {article.category}
                              </Badge>
                            </div>
                            <div className="col-span-3 sm:col-span-2">
                              <Badge variant="default" className="w-full text-center justify-center sm:w-auto sm:justify-start">
                                Published
                              </Badge>
                            </div>
                            <div className="hidden lg:block lg:col-span-2 text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(article.date), { addSuffix: true })}
                            </div>
                            <div className={cn(
                              "col-span-2 sm:col-span-2 lg:col-span-1 text-right font-medium", 
                              article.viewCount && article.viewCount > 10 ? "text-green-500" : ""
                            )}>
                              {article.viewCount || 0}
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="drafts" className="space-y-4 mt-0">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <div className="bg-muted/50 px-4 py-3 grid grid-cols-12 text-sm font-medium">
                      <div className="col-span-7 sm:col-span-6 lg:col-span-5">Title</div>
                      <div className="hidden sm:block sm:col-span-2">Category</div>
                      <div className="col-span-3 sm:col-span-2">Status</div>
                      <div className="hidden lg:block lg:col-span-2">Date</div>
                      <div className="col-span-2 sm:col-span-2 lg:col-span-1 text-right">Views</div>
                    </div>
                    <div className="divide-y">
                      {displayedArticles
                        .filter(article => !article.published)
                        .map((article) => (
                          <Link
                            key={article.id}
                            to={`/admin/article/${article.id}`}
                            className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/30 transition-colors"
                          >
                            <div className="col-span-7 sm:col-span-6 lg:col-span-5 flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded overflow-hidden shrink-0">
                                <img 
                                  src={article.coverImage} 
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                  }}
                                />
                              </div>
                              <span className="font-medium truncate">{article.title}</span>
                            </div>
                            <div className="hidden sm:block sm:col-span-2 truncate">
                              <Badge variant="outline" className="truncate max-w-full">
                                {article.category}
                              </Badge>
                            </div>
                            <div className="col-span-3 sm:col-span-2">
                              <Badge variant="outline" className="w-full text-center justify-center sm:w-auto sm:justify-start">
                                Draft
                              </Badge>
                            </div>
                            <div className="hidden lg:block lg:col-span-2 text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(article.date), { addSuffix: true })}
                            </div>
                            <div className="col-span-2 sm:col-span-2 lg:col-span-1 text-right font-medium">
                              {article.viewCount || 0}
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm bg-white dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-primary" />
                Top Performing Categories
              </CardTitle>
              <CardDescription>
                Ranked by average views per article
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : categoryStats.length > 0 ? (
                <div className="space-y-3 mt-2">
                  {[...categoryStats]
                    .sort((a, b) => (b.views / b.count) - (a.views / a.count))
                    .map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full shrink-0" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{category.count} article{category.count !== 1 ? 's' : ''}</span>
                          <span className="font-medium">
                            {Math.round(category.views / category.count)} avg. views
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-sm bg-white dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Most Viewed Articles
              </CardTitle>
              <CardDescription>
                Your top performing content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : sortedByViews.length > 0 ? (
                <div className="space-y-3 mt-2">
                  {sortedByViews.slice(0, 5).map((article, index) => (
                    <Link
                      key={article.id}
                      to={`/admin/article/${article.id}`}
                      className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-medium text-sm shrink-0">
                          {index + 1}
                        </div>
                        <span className="font-medium truncate">{article.title}</span>
                      </div>
                      <div className="font-medium text-green-500 shrink-0">
                        {article.viewCount || 0} views
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;

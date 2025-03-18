
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
import { Article } from "@/types/blog";
import { DbArticle } from "@/types/database";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { BarChart, PieChart } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Eye,
  Clock,
  Award,
  Filter
} from "lucide-react";
import { ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, Cell, Pie, Sector } from "recharts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface CategoryStat {
  name: string;
  count: number;
  views: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B8B', '#59D9A4', '#F2C94C'];

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
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">View insights about your articles</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Article Views
              </CardTitle>
              <CardDescription>
                Total views per article
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
                        labelFormatter={(label) => `Article: ${label}`}
                      />
                      <Bar dataKey="viewCount" name="Views" fill="#8884d8">
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
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Categories
              </CardTitle>
              <CardDescription>
                Articles by category
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
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Articles Performance
            </CardTitle>
            <CardDescription>
              Sorted by {sortBy === "views" ? "most views" : "most recent"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Articles</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 border-b bg-muted/50 p-4 text-sm font-medium">
                      <div className="col-span-5">Title</div>
                      <div className="col-span-2">Category</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-1 text-right">Views</div>
                    </div>
                    <div className="divide-y">
                      {displayedArticles.map((article) => (
                        <Link
                          key={article.id}
                          to={`/admin/article/${article.id}`}
                          className="grid grid-cols-12 items-center p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="col-span-5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded overflow-hidden">
                              <img 
                                src={article.coverImage} 
                                alt={article.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                            </div>
                            <span className="font-medium line-clamp-1">{article.title}</span>
                          </div>
                          <div className="col-span-2">
                            <Badge variant="outline">{article.category}</Badge>
                          </div>
                          <div className="col-span-2">
                            <Badge variant={article.published ? "default" : "outline"}>
                              {article.published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(article.date), { addSuffix: true })}
                          </div>
                          <div className={cn("col-span-1 text-right font-medium", 
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
              
              <TabsContent value="published" className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 border-b bg-muted/50 p-4 text-sm font-medium">
                      <div className="col-span-5">Title</div>
                      <div className="col-span-2">Category</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-1 text-right">Views</div>
                    </div>
                    <div className="divide-y">
                      {displayedArticles
                        .filter(article => article.published)
                        .map((article) => (
                          <Link
                            key={article.id}
                            to={`/admin/article/${article.id}`}
                            className="grid grid-cols-12 items-center p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="col-span-5 flex items-center gap-3">
                              <div className="w-8 h-8 rounded overflow-hidden">
                                <img 
                                  src={article.coverImage} 
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                  }}
                                />
                              </div>
                              <span className="font-medium line-clamp-1">{article.title}</span>
                            </div>
                            <div className="col-span-2">
                              <Badge variant="outline">{article.category}</Badge>
                            </div>
                            <div className="col-span-2">
                              <Badge variant="default">Published</Badge>
                            </div>
                            <div className="col-span-2 text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(article.date), { addSuffix: true })}
                            </div>
                            <div className={cn("col-span-1 text-right font-medium", 
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
              
              <TabsContent value="drafts" className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 border-b bg-muted/50 p-4 text-sm font-medium">
                      <div className="col-span-5">Title</div>
                      <div className="col-span-2">Category</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-1 text-right">Views</div>
                    </div>
                    <div className="divide-y">
                      {displayedArticles
                        .filter(article => !article.published)
                        .map((article) => (
                          <Link
                            key={article.id}
                            to={`/admin/article/${article.id}`}
                            className="grid grid-cols-12 items-center p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="col-span-5 flex items-center gap-3">
                              <div className="w-8 h-8 rounded overflow-hidden">
                                <img 
                                  src={article.coverImage} 
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                  }}
                                />
                              </div>
                              <span className="font-medium line-clamp-1">{article.title}</span>
                            </div>
                            <div className="col-span-2">
                              <Badge variant="outline">{article.category}</Badge>
                            </div>
                            <div className="col-span-2">
                              <Badge variant="outline">Draft</Badge>
                            </div>
                            <div className="col-span-2 text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(article.date), { addSuffix: true })}
                            </div>
                            <div className="col-span-1 text-right font-medium">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performing Categories
              </CardTitle>
              <CardDescription>
                Categories ranked by average views per article
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : categoryStats.length > 0 ? (
                <div className="space-y-4">
                  {[...categoryStats]
                    .sort((a, b) => (b.views / b.count) - (a.views / a.count))
                    .map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                          />
                          <span>{category.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{category.count} articles</span>
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
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Most Viewed Articles
              </CardTitle>
              <CardDescription>
                Top performing articles by view count
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : articles.length > 0 ? (
                <div className="space-y-4">
                  {sortedByViews.slice(0, 5).map((article, index) => (
                    <Link
                      key={article.id}
                      to={`/admin/article/${article.id}`}
                      className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-medium text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium line-clamp-1">{article.title}</span>
                      </div>
                      <div className="font-medium text-green-500">
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

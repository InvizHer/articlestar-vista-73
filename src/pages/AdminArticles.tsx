
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { 
  FilePlus,
  Search,
  Trash2,
  Eye,
  Calendar,
  CircleOff,
  CircleCheck,
  Loader2,
  LayoutDashboard,
  ArrowDownUp,
  ArrowUp,
  ArrowDown,
  BookOpen,
  BarChart3,
  ListFilter
} from "lucide-react";
import { Article } from "@/types/blog";
import { DbArticle } from "@/types/database";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import ArticleListItem from "@/components/admin/ArticleListItem";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const AdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "views" | "title">("newest");
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all");
  
  useEffect(() => {
    fetchArticles();
  }, []);
  
  const fetchArticles = async () => {
    try {
      setLoading(true);
      
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
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;
    
    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", articleToDelete.id);
        
      if (error) throw error;
      
      setArticles(articles.filter(article => article.id !== articleToDelete.id));
      toast.success("Article deleted successfully");
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article");
    } finally {
      setArticleToDelete(null);
    }
  };
  
  // Filter and sort articles
  const getFilteredArticles = () => {
    return articles
      .filter(article => {
        // Filter by status
        if (activeTab === "published" && !article.published) return false;
        if (activeTab === "draft" && article.published) return false;
        
        // Filter by search term
        if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        
        return true;
      })
      .sort((a, b) => {
        // Sort articles
        if (sortBy === "newest") {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortBy === "oldest") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortBy === "views") {
          return (b.viewCount || 0) - (a.viewCount || 0);
        } else if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  };
  
  const filteredArticles = getFilteredArticles();
    
  // Counts
  const totalArticles = articles.length;
  const publishedArticles = articles.filter(article => article.published).length;
  const draftArticles = articles.filter(article => !article.published).length;

  const handleTabChange = (value: string) => {
    setActiveTab(value as "all" | "published" | "draft");
  };

  const getSortIcon = () => {
    switch (sortBy) {
      case "newest":
      case "views":
        return <ArrowDown className="h-3.5 w-3.5" />;
      case "oldest":
        return <ArrowUp className="h-3.5 w-3.5" />;
      case "title":
        return <ArrowDownUp className="h-3.5 w-3.5" />;
      default:
        return <ArrowDownUp className="h-3.5 w-3.5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                Articles
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your blog content in one place
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="shadow-sm">
                <Link to="/admin/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild className="shadow-sm bg-primary">
                <Link to="/admin/article/new" className="flex items-center gap-2">
                  <FilePlus className="h-4 w-4" />
                  New Article
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className={cn(
              "border shadow-sm hover:shadow-md transition-shadow cursor-pointer",
              activeTab === "all" ? "ring-2 ring-primary/20" : ""
            )}
            onClick={() => handleTabChange("all")}
          >
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">All Articles</p>
                <h3 className="text-2xl font-bold">{totalArticles}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                <BookOpen className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={cn(
              "border shadow-sm hover:shadow-md transition-shadow cursor-pointer",
              activeTab === "published" ? "ring-2 ring-primary/20" : ""
            )}
            onClick={() => handleTabChange("published")}
          >
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <h3 className="text-2xl font-bold">{publishedArticles}</h3>
              </div>
              <div className="p-3 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                <CircleCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={cn(
              "border shadow-sm hover:shadow-md transition-shadow cursor-pointer",
              activeTab === "draft" ? "ring-2 ring-primary/20" : ""
            )}
            onClick={() => handleTabChange("draft")}
          >
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <h3 className="text-2xl font-bold">{draftArticles}</h3>
              </div>
              <div className="p-3 bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">
                <CircleOff className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Articles list */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">
                  {activeTab === "all" ? "All Articles" : 
                   activeTab === "published" ? "Published Articles" : "Draft Articles"}
                </CardTitle>
                <CardDescription>
                  {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'} found
                </CardDescription>
              </div>
              
              <Button variant="outline" asChild size="sm">
                <Link to="/admin/analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pb-0">
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <ListFilter className="h-4 w-4" />
                      <span className="hidden sm:inline">Filter</span>
                      <Badge className="ml-1" variant="secondary">
                        {activeTab === "all" ? "All" : activeTab === "published" ? "Published" : "Drafts"}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup value={activeTab} onValueChange={(value: any) => handleTabChange(value)}>
                      <DropdownMenuRadioItem value="all">All Articles</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="published">Published</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="draft">Drafts</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      {getSortIcon()}
                      <span className="hidden sm:inline">Sort</span>
                      <Badge className="ml-1" variant="secondary">
                        {sortBy === "newest" ? "Newest" : 
                         sortBy === "oldest" ? "Oldest" : 
                         sortBy === "views" ? "Views" : "Title"}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <DropdownMenuRadioItem value="newest">
                        <ArrowDown className="mr-2 h-3.5 w-3.5" />
                        Newest First
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="oldest">
                        <ArrowUp className="mr-2 h-3.5 w-3.5" />
                        Oldest First
                      </DropdownMenuRadioItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioItem value="views">
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        Most Views
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="title">
                        <ArrowDownUp className="mr-2 h-3.5 w-3.5" />
                        Title (A-Z)
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredArticles.length > 0 ? (
              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <ArticleListItem 
                    key={article.id}
                    article={article} 
                    onDelete={() => setArticleToDelete(article)} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <p className="text-muted-foreground mb-6">
                    {searchTerm 
                      ? `No articles found matching "${searchTerm}"`
                      : activeTab !== "all" 
                        ? `No ${activeTab} articles found` 
                        : "No articles found"}
                  </p>
                  {searchTerm ? (
                    <Button variant="outline" onClick={() => setSearchTerm("")} className="mr-2">
                      Clear Search
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link to="/admin/article/new">Create Your First Article</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          
          {filteredArticles.length > 0 && (
            <CardFooter className="py-4 mt-6 border-t flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredArticles.length} of {
                  activeTab === "all" 
                    ? totalArticles 
                    : activeTab === "published" 
                      ? publishedArticles 
                      : draftArticles
                } articles
              </p>
              
              <Button asChild>
                <Link to="/admin/article/new" className="flex items-center gap-2">
                  <FilePlus className="h-4 w-4" />
                  New Article
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      <AlertDialog open={!!articleToDelete} onOpenChange={() => setArticleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the article "{articleToDelete?.title}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteArticle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminArticles;

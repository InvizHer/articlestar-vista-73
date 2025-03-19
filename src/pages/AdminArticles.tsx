
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
  FilePlus,
  LayoutDashboard,
  BarChart3
} from "lucide-react";
import { Article } from "@/types/blog";
import { DbArticle } from "@/types/database";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import StatsCards from "@/components/admin/StatsCards";
import ArticleFilters from "@/components/admin/ArticleFilters";
import ArticlesList from "@/components/admin/ArticlesList";
import DeleteConfirmationDialog from "@/components/admin/DeleteConfirmationDialog";

const AdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleTabChange = (value: "all" | "published" | "draft") => {
    setActiveTab(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
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
        <StatsCards 
          totalArticles={totalArticles}
          publishedArticles={publishedArticles}
          draftArticles={draftArticles}
          activeTab={activeTab}
          handleTabChange={handleTabChange}
        />
        
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
            <ArticleFilters 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
            
            <ArticlesList 
              loading={loading}
              filteredArticles={filteredArticles}
              activeTab={activeTab}
              totalArticles={totalArticles}
              publishedArticles={publishedArticles}
              draftArticles={draftArticles}
              searchTerm={searchTerm}
              onDeleteArticle={setArticleToDelete}
            />
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
      
      <DeleteConfirmationDialog 
        article={articleToDelete}
        onClose={() => setArticleToDelete(null)}
        onConfirm={handleDeleteArticle}
      />
    </DashboardLayout>
  );
};

export default AdminArticles;

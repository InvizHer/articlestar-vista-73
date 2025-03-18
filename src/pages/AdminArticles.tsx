
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
  CardTitle 
} from "@/components/ui/card";
import { 
  FilePlus,
  Search,
  Trash2,
  Filter,
  Eye,
  Calendar,
  CircleOff,
  CircleCheck,
  Loader2
} from "lucide-react";
import { Article } from "@/types/blog";
import { DbArticle } from "@/types/database";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { motion } from "framer-motion";
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
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";

const AdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "views" | "title">("newest");
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  
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
  const filteredArticles = articles
    .filter(article => {
      // Filter by status
      if (filter === "published" && !article.published) return false;
      if (filter === "draft" && article.published) return false;
      
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
    
  // Counts
  const totalArticles = articles.length;
  const publishedArticles = articles.filter(article => article.published).length;
  const draftArticles = articles.filter(article => !article.published).length;
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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
            <h1 className="text-2xl font-bold">Articles</h1>
            <p className="text-muted-foreground">Manage your blog articles</p>
          </div>
          <Button asChild>
            <Link to="/admin/article/new" className="flex items-center gap-2">
              <FilePlus className="h-4 w-4" />
              New Article
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
                <h3 className="text-2xl font-bold">{totalArticles}</h3>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-full">
                <Eye className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <h3 className="text-2xl font-bold">{publishedArticles}</h3>
              </div>
              <div className="p-3 bg-green-500/10 text-green-500 rounded-full">
                <CircleCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <h3 className="text-2xl font-bold">{draftArticles}</h3>
              </div>
              <div className="p-3 bg-orange-500/10 text-orange-500 rounded-full">
                <CircleOff className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Articles</CardTitle>
            <CardDescription>
              {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      <Filter className="h-4 w-4" />
                      {filter === "all" ? "All" : filter === "published" ? "Published" : "Drafts"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup value={filter} onValueChange={(value: any) => setFilter(value)}>
                      <DropdownMenuRadioItem value="all">All Articles</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="published">Published</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="draft">Drafts</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Sort By
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="views">Most Views</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="title">Title (A-Z)</DropdownMenuRadioItem>
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
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {filteredArticles.map((article) => (
                  <motion.div key={article.id} variants={item}>
                    <ArticleListItem 
                      article={article} 
                      onDelete={() => setArticleToDelete(article)} 
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm ? (
                  <>
                    <p className="mb-2">No articles found matching "{searchTerm}"</p>
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="mb-2">No articles found</p>
                    <Button asChild>
                      <Link to="/admin/article/new">Create Your First Article</Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
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

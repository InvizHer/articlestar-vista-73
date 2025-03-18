
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DbArticle } from "@/types/database";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger,
  TabsContent 
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { 
  CalendarIcon, 
  Edit, 
  Eye, 
  Plus, 
  Trash2,
  Check,
  Search,
  Filter,
  LayoutGrid,
  List,
  CheckCircle,
  CircleSlash,
  BookOpen,
  FileClock,
  ArrowUpDown,
  MoreHorizontal,
  FileText,
  X
} from "lucide-react";

const ArticleCard = ({ article, onEdit, onView, onDelete, onTogglePublish }) => {
  const isSmall = useMediaQuery("(max-width: 640px)");
  
  return (
    <Card className="h-full transition-all hover:shadow-md group overflow-hidden">
      <div className="aspect-video w-full relative overflow-hidden bg-muted">
        <img 
          src={article.cover_image || "/placeholder.svg"} 
          alt={article.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={article.published ? "default" : "outline"} className="font-normal">
            {article.published ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Published
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <CircleSlash className="h-3 w-3" />
                Draft
              </span>
            )}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <Badge variant="secondary" className="font-normal mb-2">
            {article.category}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(article.slug)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(article.id)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTogglePublish(article)}>
                {article.published ? <X className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                {article.published ? "Unpublish" : "Publish"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(article.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="line-clamp-2 text-base sm:text-lg">
          {article.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {article.excerpt}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <CalendarIcon className="h-3 w-3" />
          <span>{format(new Date(article.date), "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          <span>{article.read_time}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

const ArticleListItem = ({ article, onEdit, onView, onDelete, onTogglePublish }) => {
  return (
    <div className="flex gap-4 p-4 border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
      <div className="hidden sm:block w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
        <img 
          src={article.cover_image || "/placeholder.svg"} 
          alt={article.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-2 mb-1">
          <Badge variant={article.published ? "default" : "outline"} className="font-normal text-xs">
            {article.published ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Published
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <CircleSlash className="h-3 w-3" />
                Draft
              </span>
            )}
          </Badge>
          <Badge variant="secondary" className="font-normal text-xs">
            {article.category}
          </Badge>
        </div>
        <h3 className="font-medium text-sm sm:text-base line-clamp-1">{article.title}</h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>{format(new Date(article.date), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{article.read_time}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onView(article.slug)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(article.id)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(article.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const MobileArticleListItem = ({ article, onEdit, onView, onDelete, onTogglePublish }) => {
  return (
    <div className="p-3 border rounded-lg mb-3">
      <div className="flex justify-between items-start mb-2">
        <Badge variant={article.published ? "default" : "outline"} className="font-normal text-xs">
          {article.published ? "Published" : "Draft"}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(article.slug)}>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(article.id)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTogglePublish(article)}>
              {article.published ? <X className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
              {article.published ? "Unpublish" : "Publish"}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(article.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h3 className="font-medium text-sm mb-1 line-clamp-1">{article.title}</h3>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{article.category}</span>
        <span>{format(new Date(article.date), "MMM d, yyyy")}</span>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [articles, setArticles] = useState<DbArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<DbArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortField, setSortField] = useState<"date" | "title" | "category">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { admin } = useAdmin();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterAndSortArticles();
  }, [articles, searchTerm, statusFilter, sortField, sortDirection]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*");

      if (error) {
        throw error;
      }

      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortArticles = () => {
    let result = [...articles];
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(article => 
        statusFilter === "published" ? article.published : !article.published
      );
    }
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(article => 
        article.title.toLowerCase().includes(term) || 
        article.category.toLowerCase().includes(term) ||
        (article.tags && article.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === "date") {
        comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortField === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === "category") {
        comparison = a.category.localeCompare(b.category);
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    setFilteredArticles(result);
  };

  const handleCreateArticle = () => {
    navigate("/admin/article/new");
  };

  const handleEditArticle = (id: string) => {
    navigate(`/admin/article/${id}`);
  };

  const handleViewArticle = (slug: string) => {
    navigate(`/article/${slug}`);
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Article deleted successfully");
      setArticles(articles.filter(article => article.id !== id));
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article");
    }
  };

  const handleTogglePublish = async (article: DbArticle) => {
    try {
      const { error } = await supabase
        .from("articles")
        .update({ published: !article.published })
        .eq("id", article.id);

      if (error) {
        throw error;
      }

      const updatedArticles = articles.map(a => {
        if (a.id === article.id) {
          return { ...a, published: !a.published };
        }
        return a;
      });

      setArticles(updatedArticles);
      toast.success(`Article ${!article.published ? "published" : "unpublished"} successfully`);
    } catch (error) {
      console.error("Error updating article:", error);
      toast.error("Failed to update article");
    }
  };

  const handleSort = (field: "date" | "title" | "category") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  const getArticleStats = () => {
    const total = articles.length;
    const published = articles.filter(a => a.published).length;
    const drafts = total - published;
    
    return { total, published, drafts };
  };

  const stats = getArticleStats();

  const EmptyState = () => (
    <div className="text-center py-8 px-4">
      <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium mb-2">No articles found</h3>
      <p className="text-muted-foreground mb-4">
        {searchTerm || statusFilter !== "all" 
          ? "Try changing your filters or search term" 
          : "Start by creating your first article"}
      </p>
      {searchTerm || statusFilter !== "all" ? (
        <Button 
          variant="outline" 
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("all");
          }}
        >
          Clear filters
        </Button>
      ) : (
        <Button onClick={handleCreateArticle}>
          <Plus className="mr-2 h-4 w-4" /> Create Article
        </Button>
      )}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredArticles.length === 0 ? (
        <div className="col-span-full">
          <EmptyState />
        </div>
      ) : (
        filteredArticles.map((article) => (
          <ArticleCard 
            key={article.id} 
            article={article}
            onEdit={handleEditArticle}
            onView={handleViewArticle}
            onDelete={handleDeleteArticle}
            onTogglePublish={handleTogglePublish}
          />
        ))
      )}
    </div>
  );

  const renderListView = () => (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-800">
      {filteredArticles.length === 0 ? (
        <EmptyState />
      ) : (
        filteredArticles.map((article) => (
          isMobile ? (
            <MobileArticleListItem
              key={article.id}
              article={article}
              onEdit={handleEditArticle}
              onView={handleViewArticle}
              onDelete={handleDeleteArticle}
              onTogglePublish={handleTogglePublish}
            />
          ) : (
            <ArticleListItem 
              key={article.id} 
              article={article}
              onEdit={handleEditArticle}
              onView={handleViewArticle}
              onDelete={handleDeleteArticle}
              onTogglePublish={handleTogglePublish}
            />
          )
        ))
      )}
    </div>
  );

  return (
    <AdminLayout>
      <div className="py-4 sm:py-6">
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Blog Dashboard</h1>
              <p className="text-muted-foreground">Manage your articles and content</p>
            </div>
            <Button onClick={handleCreateArticle} size={isMobile ? "sm" : "default"}>
              <Plus className="mr-2 h-4 w-4" /> 
              {isMobile ? "New" : "New Article"}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <BookOpen className="h-4 w-4 inline mr-2" /> Total Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <CheckCircle className="h-4 w-4 inline mr-2 text-green-500" /> Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-green-500">{stats.published}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <FileClock className="h-4 w-4 inline mr-2 text-amber-500" /> Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-amber-500">{stats.drafts}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Manage and organize your published articles and drafts</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="articles" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="articles">
                  <FileText className="h-4 w-4 mr-2" />
                  Articles
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="articles" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size={isMobile ? "sm" : "default"}>
                          <Filter className="h-4 w-4 mr-2" />
                          {statusFilter === "all" ? "All" : 
                           statusFilter === "published" ? "Published" : "Drafts"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                          All Articles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("published")}>
                          Published Only
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                          Drafts Only
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size={isMobile ? "sm" : "default"}>
                          <ArrowUpDown className="h-4 w-4 mr-2" />
                          Sort
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSort("date")}>
                          Date {sortField === "date" && (sortDirection === "asc" ? "(Oldest)" : "(Newest)")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort("title")}>
                          Title {sortField === "title" && (sortDirection === "asc" ? "(A-Z)" : "(Z-A)")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort("category")}>
                          Category {sortField === "category" && (sortDirection === "asc" ? "(A-Z)" : "(Z-A)")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={toggleViewMode}
                    >
                      {viewMode === "grid" ? (
                        <List className="h-4 w-4" />
                      ) : (
                        <LayoutGrid className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                    <p className="mt-2 text-muted-foreground">Loading articles...</p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={viewMode}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {viewMode === "grid" ? renderGridView() : renderListView()}
                    </motion.div>
                  </AnimatePresence>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

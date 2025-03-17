
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DbArticle } from "@/types/database";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CalendarIcon, 
  Edit, 
  Eye, 
  Plus, 
  Trash2,
  LogOut,
  FileText,
  Filter,
  Search,
  LayoutDashboard,
  Check,
  X,
  BarChart3,
  Settings,
  List,
  ChevronDown,
  ChevronUp,
  Tag,
  Bookmark
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";

const AdminDashboard = () => {
  const [articles, setArticles] = useState<DbArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<DbArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortField, setSortField] = useState<"date" | "title" | "category">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const { logout } = useAdmin();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
        article.tags.some(tag => tag.toLowerCase().includes(term))
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

  const handleLogout = () => {
    logout();
    navigate("/admin");
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
    setViewMode(viewMode === "table" ? "cards" : "table");
  };

  const getArticleStats = () => {
    const total = articles.length;
    const published = articles.filter(a => a.published).length;
    const drafts = total - published;
    
    // Get category counts
    const categories = articles.reduce((acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get top categories
    const topCategories = Object.entries(categories)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3);
    
    return { total, published, drafts, topCategories };
  };

  const stats = getArticleStats();

  const renderSortIcon = (field: "date" | "title" | "category") => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  const renderTableView = () => (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center">
                  Title {renderSortIcon("title")}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead 
                className="hidden md:table-cell cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category {renderSortIcon("category")}
                </div>
              </TableHead>
              <TableHead 
                className="hidden md:table-cell cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date {renderSortIcon("date")}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {searchTerm || statusFilter !== "all" ? (
                    <div>
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2 text-muted-foreground">No matching articles found</p>
                      <Button 
                        variant="link" 
                        className="mt-2"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2 text-muted-foreground">No articles found. Create your first article!</p>
                      <Button 
                        onClick={handleCreateArticle}
                        className="mt-4"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Article
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles.map((article) => (
                <TableRow key={article.id} className="group">
                  <TableCell className="font-medium truncate max-w-[240px]">
                    {article.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant={article.published ? "default" : "outline"}>
                      {article.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {article.category}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {article.date ? format(new Date(article.date), "MMM d, yyyy") : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {isMobile ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewArticle(article.slug)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditArticle(article.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePublish(article)}>
                            {article.published ? <X className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                            {article.published ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteArticle(article.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewArticle(article.slug)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditArticle(article.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={article.published ? "outline" : "default"}
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => handleTogglePublish(article)}
                        >
                          {article.published ? "Unpublish" : "Publish"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteArticle(article.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderCardsView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredArticles.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          {searchTerm || statusFilter !== "all" ? (
            <div>
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No matching articles found</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div>
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No articles found. Create your first article!</p>
              <Button 
                onClick={handleCreateArticle}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Article
              </Button>
            </div>
          )}
        </div>
      ) : (
        filteredArticles.map((article) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full flex flex-col overflow-hidden group hover:shadow-md transition-shadow">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={article.cover_image || "/placeholder.svg"}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant={article.published ? "default" : "outline"} className="mb-2">
                    {article.published ? "Published" : "Draft"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewArticle(article.slug)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditArticle(article.id)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTogglePublish(article)}>
                        {article.published ? <X className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                        {article.published ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteArticle(article.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between mt-auto text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-3 w-3" />
                    <span>{article.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{article.date ? format(new Date(article.date), "MMM d, yyyy") : "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );

  return (
    <Layout fullWidth>
      <div className="min-h-screen bg-muted/30">
        <div className="bg-background border-b sticky top-0 z-30">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{stats.published}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-500">{stats.drafts}</div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-8"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Top categories in your blog</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.topCategories.map(([category, count]) => (
                    <div key={category} className="flex items-center">
                      <div className="w-1/3 font-medium truncate">{category}</div>
                      <div className="w-2/3 flex items-center gap-2">
                        <div className="h-2 bg-primary rounded-full" style={{ width: `${(count / stats.total) * 100}%` }}></div>
                        <span className="text-sm text-muted-foreground">{count} articles</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="bg-background rounded-lg border shadow-sm">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Articles Management</h2>
                    <p className="text-sm text-muted-foreground">Manage your blog content</p>
                  </div>
                  <Button onClick={handleCreateArticle}>
                    <Plus className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">New Article</span>
                  </Button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                        <Button variant="outline" className="w-full md:w-auto">
                          <Filter className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">
                            {statusFilter === "all" ? "All Articles" : 
                             statusFilter === "published" ? "Published Only" : "Drafts Only"}
                          </span>
                          <span className="sm:hidden">Filter</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                          {statusFilter === "all" && <Check className="mr-2 h-4 w-4" />}
                          All Articles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("published")}>
                          {statusFilter === "published" && <Check className="mr-2 h-4 w-4" />}
                          Published Only
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                          {statusFilter === "draft" && <Check className="mr-2 h-4 w-4" />}
                          Drafts Only
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={toggleViewMode}
                      className="shrink-0"
                    >
                      {viewMode === "table" ? (
                        <BarChart3 className="h-4 w-4" />
                      ) : (
                        <List className="h-4 w-4" />
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
                      {viewMode === "table" ? renderTableView() : renderCardsView()}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

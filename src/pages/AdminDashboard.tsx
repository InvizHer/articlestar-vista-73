
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
  Check,
  X,
  Settings,
  List,
  ChevronDown,
  ChevronUp,
  Tag,
  Mail,
  Package,
  Users,
  LucideIcon,
  HelpCircle,
  Activity,
  Ellipsis,
  MoreHorizontal,
  LayoutDashboard,
  Menu,
  Moon,
  Sun,
  GridIcon,
  LayoutGrid
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
  CardFooter
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarItem {
  title: string;
  icon: LucideIcon;
  href?: string;
  isActive: boolean;
}

const AdminDashboard = () => {
  const [articles, setArticles] = useState<DbArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<DbArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortField, setSortField] = useState<"date" | "title" | "category">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { logout } = useAdmin();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const sidebarItems: SidebarItem[] = [
    { title: "Dashboard", icon: LayoutDashboard, isActive: true },
    { title: "Articles", icon: FileText, isActive: false },
    { title: "Categories", icon: Tag, isActive: false },
    { title: "Users", icon: Users, isActive: false },
    { title: "Comments", icon: Mail, isActive: false },
    { title: "Settings", icon: Settings, isActive: false },
    { title: "Help", icon: HelpCircle, isActive: false },
  ];

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
    
    return { total, published, drafts };
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
                            <MoreHorizontal className="h-4 w-4" />
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
                        <MoreHorizontal className="h-4 w-4" />
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
                    <Tag className="h-3 w-3" />
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex">
      {/* Sidebar */}
      <aside className={`bg-white dark:bg-zinc-800 border-r dark:border-zinc-700 fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out w-64 md:w-72`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-primary">Blog Admin</h1>
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {sidebarItems.map((item, index) => (
                <li key={index}>
                  <Button
                    variant={item.isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${item.isActive ? '' : 'text-zinc-600 dark:text-zinc-400'}`}
                    onClick={() => {/* Handle nav click */}}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.title}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t dark:border-zinc-700">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 ${isSidebarOpen ? 'md:ml-72' : 'md:ml-72'} transition-all duration-200`}>
        <header className="bg-white dark:bg-zinc-800 border-b dark:border-zinc-700 sticky top-0 z-40">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden mr-2">
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold md:hidden">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle dark mode</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Activity className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Activity</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your blog content and monitor performance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{stats.published}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-500">{stats.drafts}</div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-lg border dark:border-zinc-700 shadow-sm mb-8">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Articles Management</h2>
                  <p className="text-sm text-muted-foreground">Manage your blog content</p>
                </div>
                <Button onClick={handleCreateArticle} className="bg-gradient-to-r from-primary to-primary/80">
                  <Plus className="mr-2 h-4 w-4" /> New Article
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
                      <LayoutGrid className="h-4 w-4" />
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
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

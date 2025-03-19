
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { DbArticle } from "@/types/database";
import { Article } from "@/types/blog";
import ArticleGrid from "@/components/blog/ArticleGrid";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  Newspaper, 
  RefreshCw, 
  ChevronDown,
  BookOpen,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";
import { useIsMobile } from "@/hooks/use-mobile";

const convertDbArticleToArticle = (dbArticle: DbArticle): Article => {
  return {
    id: dbArticle.id,
    title: dbArticle.title,
    slug: dbArticle.slug,
    excerpt: dbArticle.excerpt,
    content: dbArticle.content,
    author: {
      name: dbArticle.author_name,
      avatar: dbArticle.author_avatar || "/placeholder.svg"
    },
    date: new Date(dbArticle.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    readTime: dbArticle.read_time,
    category: dbArticle.category,
    tags: dbArticle.tags,
    coverImage: dbArticle.cover_image || "/placeholder.svg",
    published: dbArticle.published,
    viewCount: dbArticle.view_count || 0
  };
};

const Articles = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get("search") || "";
  const initialPage = parseInt(searchParams.get("page") || "1");
  
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFeaturedMode, setIsFeaturedMode] = useState(false);
  const isMobile = useIsMobile();
  const { themeColor } = useTheme();
  
  const articlesPerPage = 6; // Changed to 6 articles per page

  // Add a new useEffect to scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [currentPage]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (currentPage > 1) params.set("page", currentPage.toString());
    setSearchParams(params);
  }, [searchTerm, currentPage, setSearchParams]);

  const fetchArticles = async () => {
    try {
      const { count, error: countError } = await supabase
        .from("articles")
        .select("*", { count: "exact" })
        .eq("published", true);

      if (countError) throw countError;
      
      if (count !== null) {
        setTotalPages(Math.ceil(count / articlesPerPage));
      }

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .order("date", { ascending: false })
        .range((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage - 1);

      if (error) {
        throw error;
      }

      const articlesData = (data || []).map(convertDbArticleToArticle);
      setArticles(articlesData);

      const uniqueCategories = Array.from(
        new Set(articlesData.map(article => article.category))
      ).filter(Boolean);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = searchTerm ? (
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    ) : true;

    const matchesCategory = !selectedCategory || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
  };

  const generatePagination = () => {
    const pages = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2) + 1);
      let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
      
      if (currentPage <= Math.floor(maxVisiblePages / 2)) {
        endPage = maxVisiblePages - 2;
      } else if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
        startPage = totalPages - maxVisiblePages + 2;
      }
      
      if (startPage > 2) {
        pages.push('ellipsis-start');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <Layout>
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`bg-gradient-to-b from-${themeColor}/10 via-${themeColor}/5 to-background pt-16 pb-24 relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl opacity-70 -z-10 transform translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl opacity-70 -z-10 transform -translate-x-1/4 translate-y-1/4"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Badge className="mb-3 px-3 py-1 bg-primary/10 text-primary border-primary/20 backdrop-blur-sm">
                Explore Our Collection
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Discover Insightful <span className="text-primary">Articles</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Browse our curated collection of articles covering web development, 
                design trends, tech innovations, and industry insights.
              </p>
            </motion.div>
            
            <motion.form 
              onSubmit={handleSearchSubmit} 
              className="relative flex max-w-md mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  className="pl-10 pr-4 h-12 rounded-l-full w-full border-r-0 focus-visible:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" className="rounded-r-full">
                Search
              </Button>
            </motion.form>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 -mt-12">
        {/* Category Filter */}
        {categories.length > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-10"
          >
            <Card className="border shadow-sm bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-wrap gap-2 items-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="gap-1"
                  >
                    <Filter className="h-4 w-4" />
                    Categories
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isFilterOpen && "rotate-180")} />
                  </Button>
                  
                  <div className="flex gap-2 items-center ml-auto">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsFeaturedMode(!isFeaturedMode)}
                      className={cn(
                        "gap-1",
                        isFeaturedMode && "bg-primary/10 text-primary"
                      )}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">Featured View</span>
                    </Button>
                  </div>
                  
                  {(isFilterOpen || (!isMobile && categories.length < 8)) && (
                    <div className="flex flex-wrap gap-2 items-center mt-3 w-full">
                      <Badge
                        variant={!selectedCategory ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-colors",
                          !selectedCategory 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-primary/10"
                        )}
                        onClick={() => setSelectedCategory(null)}
                      >
                        All Topics
                      </Badge>
                      
                      {categories.map((category) => (
                        <Badge
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-colors",
                            selectedCategory === category 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-primary/10"
                          )}
                          onClick={() => handleCategoryClick(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border bg-card h-[400px]">
                <div className="aspect-video bg-muted w-full rounded-t-xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="flex justify-between pt-4">
                    <div className="h-8 bg-muted rounded-full w-20"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {selectedCategory ? selectedCategory : 'All Articles'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredArticles.length} of {articles.length} articles
                  </p>
                </div>
              </div>
              
              {searchTerm && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSearchTerm('')}
                  className="gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Clear Search
                </Button>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <ArticleGrid 
                articles={filteredArticles} 
                columns={isFeaturedMode && !isMobile ? 2 : 3} 
              />
            </motion.div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div 
                className="mt-12 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          if (currentPage > 1) handlePageChange(currentPage - 1); 
                        }}
                        className={currentPage === 1 ? "opacity-50 pointer-events-none" : ""}
                      />
                    </PaginationItem>
                    
                    {generatePagination().map((page, i) => (
                      typeof page === 'number' ? (
                        <PaginationItem key={`page-${page}`}>
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                            isActive={page === currentPage}
                            className={page === currentPage ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          if (currentPage < totalPages) handlePageChange(currentPage + 1); 
                        }}
                        className={currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="text-center py-16 border shadow-sm bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Newspaper className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm 
                      ? `We couldn't find any articles matching "${searchTerm}"`
                      : selectedCategory 
                      ? `No articles found in the "${selectedCategory}" category` 
                      : "Try a different search term or category."}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => { 
                        setSearchTerm(''); 
                        setSelectedCategory(null); 
                        setCurrentPage(1);
                      }}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Articles;


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
import { Search, Filter, Newspaper, RefreshCw } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    published: dbArticle.published
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
  const articlesPerPage = 9;

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
      );
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
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
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
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="All Articles"
          description="Browse our collection of articles on web development, design, and technology."
        />

        <Card className="mb-8 border shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Newspaper className="h-5 w-5 text-primary" />
              Browse Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearchSubmit} className="relative mb-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <Filter className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-sm text-muted-foreground mr-2">Categories:</span>
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
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border bg-card h-96">
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
            <ArticleGrid articles={filteredArticles} columns={3} />
            
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
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
              </div>
            )}
          </>
        ) : (
          <Card className="text-center py-12 border shadow-sm">
            <CardContent className="pt-6">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground mb-6">Try a different search term or category.</p>
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
        )}
      </div>
    </Layout>
  );
};

export default Articles;


import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { DbArticle } from "@/types/database";
import { Article } from "@/types/blog";
import ArticleGrid from "@/components/blog/ArticleGrid";
import FeaturedArticle from "@/components/blog/FeaturedArticle";
import ArticleCard from "@/components/blog/ArticleCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronRight, BookOpen, TrendingUp, Clock, Sparkles, Bookmark, Rss } from "lucide-react";
import { motion } from "framer-motion";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper function to convert DbArticle to Article
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
    coverImage: dbArticle.cover_image || "/placeholder.svg"
  };
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'all' | 'trending' | 'latest'>('all');
  const articlesPerPage = 6;

  useEffect(() => {
    fetchArticles();
  }, [currentPage, selectedCategory, viewMode]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("articles")
        .select("*", { count: 'exact' })
        .eq("published", true);
      
      // Apply category filter if selected
      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }
      
      // Apply sorting based on view mode
      if (viewMode === 'latest') {
        query = query.order("date", { ascending: false });
      } else if (viewMode === 'trending') {
        // For this example, we'll simulate trending by using the most recent articles
        // In a real app, you might have a view_count or popularity column
        query = query.order("date", { ascending: false });
      } else {
        query = query.order("date", { ascending: false });
      }
      
      // Apply pagination
      const from = (currentPage - 1) * articlesPerPage;
      const to = from + articlesPerPage - 1;
      
      const { data, error, count } = await query
        .range(from, to);
      
      if (error) {
        throw error;
      }

      const articles = (data || []).map(convertDbArticleToArticle);
      setArticles(articles);
      
      // Set total pages based on count
      if (count !== null) {
        setTotalPages(Math.ceil(count / articlesPerPage));
      }
      
      // Fetch all categories if not already loaded
      if (categories.length === 0) {
        const { data: categoryData } = await supabase
          .from("articles")
          .select("category")
          .eq("published", true);
        
        if (categoryData) {
          const uniqueCategories = Array.from(
            new Set(categoryData.map(item => item.category))
          );
          setCategories(uniqueCategories);
        }
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
    setCurrentPage(1); // Reset to first page when changing category
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: document.getElementById('articles-section')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const regularArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <Layout fullWidth>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span 
              variants={fadeInUp}
              className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-6"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Welcome to BlogHub
            </motion.span>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600"
            >
              Discover Insights That Matter
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-muted-foreground mb-8"
            >
              Explore thought-provoking articles on web development, design, and technology
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button asChild size="lg" className="rounded-full">
                <Link to="/articles">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse Articles
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <a href="#articles-section">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Trending Now
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {loading && articles.length === 0 ? (
        <div className="container mx-auto my-20 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-48 bg-muted rounded mb-8"></div>
            <div className="h-64 w-full max-w-4xl bg-muted rounded mb-8"></div>
            <div className="h-64 w-full max-w-4xl bg-muted rounded"></div>
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="container mx-auto my-20 text-center">
          <p className="text-muted-foreground mb-6">No articles published yet.</p>
          <Link to="/articles">
            <Button className="rounded-full">View All Articles</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Featured Article */}
          {featuredArticle && (
            <section id="featured" className="container mx-auto py-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center justify-between mb-10"
              >
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Featured Story</h2>
                  <p className="text-muted-foreground mt-1">Our top pick for you</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <FeaturedArticle article={featuredArticle} />
              </motion.div>
            </section>
          )}

          {/* Articles Section with Filtering */}
          <section id="articles-section" className="container mx-auto py-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Articles</h2>
                  <p className="text-muted-foreground mt-1">Explore our latest content</p>
                </div>
                
                <div className="mt-4 sm:mt-0">
                  <Tabs 
                    value={viewMode} 
                    onValueChange={(value) => {
                      setViewMode(value as 'all' | 'trending' | 'latest');
                      setCurrentPage(1);
                    }}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="trending">Trending</TabsTrigger>
                      <TabsTrigger value="latest">Latest</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              
              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Articles grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="animate-pulse rounded-xl border bg-card shadow-sm h-96">
                      <div className="h-48 bg-muted rounded-t-xl"></div>
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-6 bg-muted rounded w-5/6"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                        <div className="flex justify-between">
                          <div className="h-8 w-8 bg-muted rounded-full"></div>
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : regularArticles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No articles found. Try a different category or view mode.</p>
                </div>
              ) : (
                <ArticleGrid articles={regularArticles} columns={3} />
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-12">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={currentPage === i + 1}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </motion.div>
          </section>
          
          {/* Newsletter Section */}
          <section className="bg-muted/50 py-20 px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="container mx-auto max-w-4xl"
            >
              <div className="bg-gradient-to-br from-background to-background/80 border backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-sm">
                <div className="text-center mb-8">
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-4">
                    <Rss className="w-4 h-4 mr-1" />
                    Stay Updated
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Get the latest articles and insights delivered straight to your inbox. No spam, just valuable content.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex h-12 w-full rounded-full border border-input bg-background px-6 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <Button type="submit" className="h-12 rounded-full px-6">Subscribe</Button>
                </div>
              </div>
            </motion.div>
          </section>
        </>
      )}
    </Layout>
  );
};

export default Index;

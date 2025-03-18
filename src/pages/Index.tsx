
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { DbArticle } from "@/types/database";
import { Article } from "@/types/blog";
import ArticleGrid from "@/components/blog/ArticleGrid";
import FeaturedArticle from "@/components/blog/FeaturedArticle";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  BookOpen, 
  TrendingUp, 
  Sparkles, 
  ChevronRight, 
  ArrowRight, 
  BookMarked,
  Bookmark,
  LayoutGrid, 
  Github,
  Instagram,
  Linkedin,
  Youtube,
  Tag
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import CategoryBadge from "@/components/blog/CategoryBadge";

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
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentArticles();
  }, []);

  const fetchRecentArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .order("date", { ascending: false })
        .limit(7); // Fetch 7 articles (1 featured + 6 recent)

      if (error) {
        throw error;
      }

      const articles = (data || []).map(convertDbArticleToArticle);
      setRecentArticles(articles);
      
      // Extract unique categories and tags
      const uniqueCategories = [...new Set(articles.map(article => article.category))];
      setCategories(uniqueCategories);
      
      // Extract and count tags to find popular ones
      const allTags = articles.flatMap(article => article.tags);
      const tagCounts = allTags.reduce((acc: {[key: string]: number}, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});
      
      // Sort tags by count and take top 6
      const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]).slice(0, 6);
      setPopularTags(sortedTags);
      
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const featuredArticle = recentArticles.length > 0 ? recentArticles[0] : null;
  const recentArticlesDisplay = recentArticles.length > 1 ? recentArticles.slice(1, 7) : [];

  return (
    <Layout fullWidth>
      {/* Hero Section with Gradient Background */}
      <section className="bg-gradient-to-b from-primary/10 via-background to-background pt-16 pb-24 px-4 sm:px-6 lg:px-8">
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
                <a href="#featured">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Trending Now
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {loading ? (
        <div className="container mx-auto my-20 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-48 bg-muted rounded mb-8"></div>
            <div className="h-64 w-full max-w-4xl bg-muted rounded mb-8"></div>
            <div className="h-64 w-full max-w-4xl bg-muted rounded"></div>
          </div>
        </div>
      ) : recentArticles.length === 0 ? (
        <div className="container mx-auto my-20 text-center">
          <p className="text-muted-foreground mb-6">No articles published yet.</p>
          <Link to="/articles">
            <Button className="rounded-full">View All Articles</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Featured Article Section */}
          <section id="featured" className="container mx-auto py-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-10"
            >
              <div className="flex items-center">
                <div className="h-10 w-1 bg-primary rounded-full mr-4"></div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Featured Story</h2>
                  <p className="text-muted-foreground mt-1">Our top pick for you</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-2 text-muted-foreground">
                <BookMarked className="w-5 h-5" />
                <span>Editor's Choice</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {featuredArticle && <FeaturedArticle article={featuredArticle} />}
            </motion.div>
          </section>

          {/* Categories Section */}
          <section className="bg-muted/30 py-12">
            <div className="container mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-8">
                  <Tag className="w-5 h-5 mr-2 text-primary" />
                  <h2 className="text-2xl font-bold">Explore Categories</h2>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {categories.map((category, index) => (
                    <CategoryBadge key={index} category={category} count={index + 3} link={`/articles?category=${category}`} />
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Recent Articles */}
          {recentArticlesDisplay.length > 0 && (
            <section className="container mx-auto py-16">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row sm:items-center justify-between mb-10"
              >
                <div className="flex items-center">
                  <div className="h-10 w-1 bg-primary rounded-full mr-4"></div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Latest Articles</h2>
                    <p className="text-muted-foreground mt-1">Stay up to date with our newest content</p>
                  </div>
                </div>
                
                <Button asChild variant="outline" className="mt-4 sm:mt-0 rounded-full group">
                  <Link to="/articles" className="inline-flex items-center">
                    View All Articles
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
              
              <ArticleGrid articles={recentArticlesDisplay} columns={3} />
            </section>
          )}
          
          {/* Popular Tags Section */}
          <section className="bg-gradient-to-r from-primary/5 to-background py-14">
            <div className="container mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="mb-10 text-center"
              >
                <h2 className="text-2xl font-bold mb-2">Popular Topics</h2>
                <p className="text-muted-foreground">Discover content by popular tags</p>
              </motion.div>
              
              <div className="flex flex-wrap justify-center gap-3">
                {popularTags.map((tag, index) => (
                  <Link 
                    key={index} 
                    to={`/articles?tag=${tag}`}
                    className="py-2 px-4 rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </section>
          
          {/* Connect With Us Section (Replacing Newsletter) */}
          <section className="container mx-auto py-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-r from-primary/5 via-background to-primary/5 border-none shadow-md rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-8 md:p-10 flex flex-col justify-center">
                      <h2 className="text-3xl font-bold mb-4">Connect With Us</h2>
                      <p className="text-muted-foreground mb-6">
                        Follow us on social media to stay updated with the latest articles, 
                        industry news, and behind-the-scenes content.
                      </p>
                      
                      <div className="flex flex-wrap gap-4">
                        <a 
                          href="https://github.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-12 h-12 rounded-full bg-background shadow-sm hover:shadow-md transition-all border border-border"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                        <a 
                          href="https://instagram.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-12 h-12 rounded-full bg-background shadow-sm hover:shadow-md transition-all border border-border"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                        <a 
                          href="https://linkedin.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-12 h-12 rounded-full bg-background shadow-sm hover:shadow-md transition-all border border-border"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                        <a 
                          href="https://youtube.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-12 h-12 rounded-full bg-background shadow-sm hover:shadow-md transition-all border border-border"
                        >
                          <Youtube className="h-5 w-5" />
                        </a>
                      </div>
                      
                      <div className="mt-8">
                        <Button asChild className="rounded-full">
                          <Link to="/contact">
                            Get In Touch
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="hidden md:block relative h-full min-h-[300px] bg-muted">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent">
                        <div className="absolute inset-0 opacity-10 bg-[url('/placeholder.svg')] bg-center bg-cover"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <LayoutGrid className="w-20 h-20 text-primary/20" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        </>
      )}
    </Layout>
  );
};

export default Index;


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
import { ChevronRight, BookOpen, TrendingUp, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
        .limit(5);

      if (error) {
        throw error;
      }

      const articles = (data || []).map(convertDbArticleToArticle);
      setRecentArticles(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const featuredArticle = recentArticles.length > 0 ? recentArticles[0] : null;
  const otherArticles = recentArticles.length > 1 ? recentArticles.slice(1) : [];

  return (
    <Layout fullWidth>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background pt-12 pb-20 px-4 sm:px-6 lg:px-8">
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
          {/* Featured Article */}
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
              {featuredArticle && <FeaturedArticle article={featuredArticle} />}
            </motion.div>
          </section>

          {/* Recent Articles */}
          {otherArticles.length > 0 && (
            <section className="container mx-auto py-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row sm:items-center justify-between mb-10"
              >
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Latest Articles</h2>
                  <p className="text-muted-foreground mt-1">Stay up to date with our newest content</p>
                </div>
                
                <Button asChild variant="outline" className="mt-4 sm:mt-0 rounded-full group">
                  <Link to="/articles" className="inline-flex items-center">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
              
              <ArticleGrid articles={otherArticles} columns={3} />
            </section>
          )}
        </>
      )}
      
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
                <Clock className="w-4 h-4 mr-1" />
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
    </Layout>
  );
};

export default Index;

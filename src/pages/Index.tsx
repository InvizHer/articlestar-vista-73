
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Hero from "@/components/common/Hero";
import { supabase } from "@/integrations/supabase/client";
import { DbArticle } from "@/types/database";
import { Article } from "@/types/blog";
import ArticleGrid from "@/components/blog/ArticleGrid";
import FeaturedArticle from "@/components/blog/FeaturedArticle";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
        .limit(4);

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
    <Layout>
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Hero
          title="Welcome to BlogHub"
          subtitle="Discover insightful articles on web development, design, and technology"
          ctaText="Browse All Articles"
          ctaLink="/articles"
        />

        {loading ? (
          <div className="mt-16 text-center">Loading articles...</div>
        ) : recentArticles.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">No articles published yet.</p>
            <Link to="/articles">
              <Button>View All Articles</Button>
            </Link>
          </div>
        ) : (
          <>
            <section className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight">Featured Article</h2>
              </div>
              {featuredArticle && <FeaturedArticle article={featuredArticle} />}
            </section>

            {otherArticles.length > 0 && (
              <section className="mt-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">Recent Articles</h2>
                  <Button asChild variant="outline">
                    <Link to="/articles">View All</Link>
                  </Button>
                </div>
                <ArticleGrid articles={otherArticles} columns={2} />
              </section>
            )}
          </>
        )}

        <section className="mt-20 py-12 px-6 bg-muted rounded-lg text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Stay updated with our latest articles and news. No spam, just valuable content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button type="submit">Subscribe</Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;

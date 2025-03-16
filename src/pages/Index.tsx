
import React from "react";
import Layout from "@/components/layout/Layout";
import Hero from "@/components/common/Hero";
import { getRecentArticles } from "@/data/articles";
import ArticleGrid from "@/components/blog/ArticleGrid";
import FeaturedArticle from "@/components/blog/FeaturedArticle";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const recentArticles = getRecentArticles(3);
  const featuredArticle = recentArticles[0];
  const otherArticles = recentArticles.slice(1);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Hero
          title="Welcome to BlogHub"
          subtitle="Discover insightful articles on web development, design, and technology"
          ctaText="Browse All Articles"
          ctaLink="/articles"
        />

        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Featured Article</h2>
          </div>
          <FeaturedArticle article={featuredArticle} />
        </section>

        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Recent Articles</h2>
            <Button asChild variant="outline">
              <Link to="/articles">View All</Link>
            </Button>
          </div>
          <ArticleGrid articles={otherArticles} columns={2} />
        </section>

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

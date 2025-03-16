
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";
import { articles } from "@/data/articles";
import ArticleGrid from "@/components/blog/ArticleGrid";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

const Articles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(
    new Set(articles.map((article) => article.category))
  );

  // Filter articles based on search and category
  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) || 
      article.excerpt
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          title="All Articles"
          description="Browse our collection of articles on web development, design, and technology."
        />

        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {filteredArticles.length > 0 ? (
          <ArticleGrid articles={filteredArticles} columns={3} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found. Try a different search term or category.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Articles;

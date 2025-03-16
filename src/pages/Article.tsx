
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { getArticleBySlug, getRelatedArticles } from "@/data/articles";
import { CalendarIcon, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ArticleGrid from "@/components/blog/ArticleGrid";
import { Button } from "@/components/ui/button";
import { marked } from "marked";

const Article = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const article = slug ? getArticleBySlug(slug) : undefined;
  const relatedArticles = slug ? getRelatedArticles(slug, 2) : [];

  useEffect(() => {
    if (!article) {
      navigate("/not-found");
    }
    window.scrollTo(0, 0);
  }, [article, navigate]);

  if (!article) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <article className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex gap-2 mb-4">
              <Badge variant="outline">{article.category}</Badge>
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>By {article.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>

          <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted mb-12">
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div 
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: marked.parse(article.content) }}
          />

          <div className="mt-12 pt-8 border-t">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-semibold">Share this article:</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Twitter</Button>
                <Button variant="outline" size="sm">Facebook</Button>
                <Button variant="outline" size="sm">LinkedIn</Button>
              </div>
            </div>
          </div>
        </article>

        {relatedArticles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
            <ArticleGrid articles={relatedArticles} columns={2} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Article;


import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { DbArticle } from "@/types/database";
import { Article as ArticleType } from "@/types/blog";
import { CalendarIcon, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ArticleGrid from "@/components/blog/ArticleGrid";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Helper function to convert DbArticle to Article
const convertDbArticleToArticle = (dbArticle: DbArticle): ArticleType => {
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

const Article = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ArticleType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchArticle(slug);
    }
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchArticle = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        const articleData = convertDbArticleToArticle(data);
        setArticle(articleData);
        fetchRelatedArticles(data.category, data.tags, data.id);
      } else {
        navigate("/not-found");
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      toast.error("Failed to load article");
      navigate("/not-found");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async (category: string, tags: string[], currentId: string) => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .neq("id", currentId)
        .eq("category", category)
        .limit(3);

      if (error) {
        throw error;
      }

      const relatedData = (data || []).map(convertDbArticleToArticle);
      setRelatedArticles(relatedData);
    } catch (error) {
      console.error("Error fetching related articles:", error);
      // We don't show an error toast for related articles as it's not critical
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
          Loading article...
        </div>
      </Layout>
    );
  }

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
            className="prose prose-slate max-w-none prose-img:rounded-lg prose-headings:font-bold prose-a:text-blue-600"
            dangerouslySetInnerHTML={{ __html: article.content }}
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

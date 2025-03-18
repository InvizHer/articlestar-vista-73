
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { DbArticle } from "@/types/database";
import { Article as ArticleType } from "@/types/blog";
import { CalendarIcon, Clock, User, ChevronLeft, Share2, Bookmark, Twitter, Facebook, Linkedin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ArticleGrid from "@/components/blog/ArticleGrid";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { useBookmarks } from "@/hooks/use-bookmarks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
    coverImage: dbArticle.cover_image || "/placeholder.svg",
    published: dbArticle.published
  };
};

const Article = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ArticleType[]>([]);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const { isBookmarked, toggleBookmark } = useBookmarks();

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
        
        // Add IDs to headings for table of contents
        setTimeout(() => {
          if (contentRef.current) {
            const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headings.forEach((heading, index) => {
              if (!heading.id) {
                heading.id = `heading-${index}`;
              }
            });
          }
        }, 100);
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

  const handleShare = (platform: string) => {
    const url = window.location.href;
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article!.title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(article!.title)}`;
        break;
      default:
        // Just copy to clipboard if no platform
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
          <div className="animate-pulse space-y-8 w-full max-w-3xl">
            <div className="h-8 bg-muted rounded w-2/3 mx-auto"></div>
            <div className="h-96 bg-muted rounded w-full"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row gap-8"
        >
          <div className="w-full lg:w-3/4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-6 text-muted-foreground hover:text-primary"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            
            <article>
              <div className="mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground">
                    {article.category}
                  </Badge>
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-secondary/50">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm text-muted-foreground border-b pb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      <img 
                        src={article.author.avatar} 
                        alt={article.author.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{article.author.name}</div>
                      <div className="flex items-center text-xs">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {article.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{article.readTime}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => toggleBookmark(article)}
                    >
                      <Bookmark 
                        className={`h-4 w-4 ${isBookmarked(article.id) ? "fill-primary text-primary" : ""}`} 
                      />
                    </Button>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-full">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" align="end">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full text-[#1DA1F2] hover:bg-[#1DA1F2]/10"
                            onClick={() => handleShare('twitter')}
                          >
                            <Twitter className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full text-[#1877F2] hover:bg-[#1877F2]/10"
                            onClick={() => handleShare('facebook')}
                          >
                            <Facebook className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full text-[#0A66C2] hover:bg-[#0A66C2]/10"
                            onClick={() => handleShare('linkedin')}
                          >
                            <Linkedin className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full"
                            onClick={() => handleShare('')}
                          >
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                            </svg>
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted mb-12 shadow-md">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div 
                ref={contentRef}
                className="prose prose-slate max-w-none prose-img:rounded-xl prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-headings:scroll-m-20 prose-p:leading-7 prose-blockquote:border-l-primary/50 prose-pre:bg-muted"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              <div className="mt-12 pt-8 border-t">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full mr-2"
                      onClick={() => toggleBookmark(article)}
                    >
                      <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked(article.id) ? "fill-primary text-primary" : ""}`} />
                      {isBookmarked(article.id) ? "Bookmarked" : "Bookmark"}
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full text-[#1DA1F2] hover:bg-[#1DA1F2]/10"
                      onClick={() => handleShare('twitter')}
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full text-[#1877F2] hover:bg-[#1877F2]/10"
                      onClick={() => handleShare('facebook')}
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full text-[#0A66C2] hover:bg-[#0A66C2]/10"
                      onClick={() => handleShare('linkedin')}
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          </div>
          
          <div className="w-full lg:w-1/4 space-y-6">
            <TableOfContents contentRef={contentRef} className="hidden lg:block" />
            
            {/* Author card */}
            <div className="rounded-lg border bg-card shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                  <img 
                    src={article.author.avatar} 
                    alt={article.author.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{article.author.name}</div>
                  <div className="text-sm text-muted-foreground">Author</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Content creator specializing in {article.category} and related topics. Follow for more insights!
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Profile
              </Button>
            </div>
          </div>
        </motion.div>

        {relatedArticles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-20"
          >
            <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
            <ArticleGrid articles={relatedArticles} columns={3} />
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Article;

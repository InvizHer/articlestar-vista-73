import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { DbArticle } from "@/types/database";
import { Article as ArticleType } from "@/types/blog";
import { 
  CalendarIcon, 
  Clock, 
  User, 
  ChevronLeft, 
  Share2, 
  Bookmark, 
  Twitter, 
  Facebook, 
  Linkedin,
  Copy,
  MessageCircle,
  BookmarkCheck,
  AlignJustify
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ArticleGrid from "@/components/blog/ArticleGrid";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

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
  const [shareOpen, setShareOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [headings, setHeadings] = useState<{id: string, text: string, level: number}[]>([]);

  useEffect(() => {
    if (slug) {
      fetchArticle(slug);
    }
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (article) {
      try {
        const savedBookmarks = localStorage.getItem('bookmarks');
        if (savedBookmarks) {
          const bookmarks = JSON.parse(savedBookmarks);
          setIsBookmarked(bookmarks.some((bookmark: ArticleType) => bookmark.id === article.id));
        }
      } catch (error) {
        console.error('Failed to check bookmarks:', error);
      }
    }
  }, [article]);

  useEffect(() => {
    if (!article) return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      
      if (documentHeight > 0) {
        setReadingProgress(Math.min((scrolled / documentHeight) * 100, 100));
      }
    };
    
    const articleContent = document.querySelector('.article-content');
    if (articleContent) {
      const headingElements = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const extractedHeadings = Array.from(headingElements).map(heading => {
        const id = heading.id || `heading-${Math.random().toString(36).substr(2, 9)}`;
        if (!heading.id) heading.id = id;
        
        return {
          id,
          text: heading.textContent || '',
          level: parseInt(heading.tagName.substring(1))
        };
      });
      
      setHeadings(extractedHeadings);
    }
    
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [article]);

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
    }
  };

  const toggleBookmark = () => {
    if (!article) return;
    
    try {
      const savedBookmarks = localStorage.getItem('bookmarks');
      let bookmarks: ArticleType[] = savedBookmarks ? JSON.parse(savedBookmarks) : [];
      
      if (isBookmarked) {
        bookmarks = bookmarks.filter(bookmark => bookmark.id !== article.id);
        toast.success("Removed from bookmarks");
      } else {
        bookmarks.push(article);
        toast.success("Saved to bookmarks");
      }
      
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Failed to update bookmarks:', error);
      toast.error("Failed to update bookmarks");
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article?.title || '')}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(article?.title || '')}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${article?.title || ''} ${url}`)}`;
        break;
      default:
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
        return;
    }
    
    window.open(shareUrl, '_blank');
  };

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-primary"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setShowTableOfContents(!showTableOfContents)}
              >
                <AlignJustify className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Contents</span>
              </Button>
              
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={toggleBookmark}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 mr-2" />
                ) : (
                  <Bookmark className="h-4 w-4 mr-2" />
                )}
                <span className="hidden sm:inline">
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </span>
              </Button>
            </div>
          </div>
          
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

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground border-b pb-6">
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
                <div className="ml-auto relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setShareOpen(!shareOpen)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  
                  {shareOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 p-2 bg-background border rounded-lg shadow-lg z-10 flex gap-1"
                    >
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
                        className="rounded-full text-[#25D366] hover:bg-[#25D366]/10"
                        onClick={() => handleShare('whatsapp')}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full"
                        onClick={() => handleShare('')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
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
            
            <div className="mb-8">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.round(readingProgress)}%</span>
              </div>
              <Progress value={readingProgress} className="h-1" />
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {showTableOfContents && headings.length > 0 && (
                <motion.aside
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="hidden md:block w-56 flex-shrink-0 sticky top-20 max-h-[calc(100vh-80px)] overflow-auto"
                >
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-3">Table of Contents</h3>
                    <ul className="space-y-2 text-sm">
                      {headings.map(heading => (
                        <li 
                          key={heading.id}
                          className={`cursor-pointer hover:text-primary transition-colors pl-${(heading.level - 1) * 2}`}
                          onClick={() => scrollToHeading(heading.id)}
                        >
                          {heading.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.aside>
              )}
              
              {showTableOfContents && headings.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="md:hidden mb-8 border rounded-md p-4"
                >
                  <h3 className="font-medium mb-3">Table of Contents</h3>
                  <ul className="space-y-2 text-sm">
                    {headings.map(heading => (
                      <li 
                        key={heading.id}
                        className={`cursor-pointer hover:text-primary transition-colors pl-${(heading.level - 1) * 2}`}
                        onClick={() => {
                          scrollToHeading(heading.id);
                          setShowTableOfContents(false);
                        }}
                      >
                        {heading.text}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
              
              <div 
                className="article-content prose prose-slate max-w-none prose-img:rounded-xl prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-headings:scroll-m-20 prose-p:leading-7 prose-blockquote:border-l-primary/50 prose-pre:bg-muted"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            <div className="mt-12 pt-8 border-t">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Button 
                    variant={isBookmarked ? "default" : "outline"}
                    size="sm" 
                    className="rounded-full mr-2"
                    onClick={toggleBookmark}
                  >
                    {isBookmarked ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 mr-2" />
                        Bookmarked
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Bookmark
                      </>
                    )}
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
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full text-[#25D366] hover:bg-[#25D366]/10"
                    onClick={() => handleShare('whatsapp')}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </article>
        </motion.div>

        {relatedArticles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-20"
          >
            <h2 className="text-2xl font-bold mb-8">You might also like</h2>
            <ArticleGrid articles={relatedArticles} columns={3} />
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Article;

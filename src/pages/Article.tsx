import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { DbArticle } from "@/types/database";
import { Article as ArticleType } from "@/types/blog";
import { CalendarIcon, Clock, ChevronLeft, Share2, Bookmark, Twitter, Facebook, Linkedin, Eye, User, MessageCircle, Heart, UserCircle, MessageSquare, WhatsApp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
    published: dbArticle.published,
    viewCount: dbArticle.view_count || 0
  };
};

const AuthorProfile = ({ author }: { author: ArticleType['author'] }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full rounded-full">
          <UserCircle className="h-4 w-4 mr-2" />
          View Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-background to-purple-50/50 dark:from-background dark:to-purple-950/10 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-32 bg-gradient-to-r from-primary to-purple-500 relative"
        >
          <div className="absolute -bottom-12 left-6 w-24 h-24 rounded-full border-4 border-background overflow-hidden shadow-md">
            <img 
              src={author.avatar} 
              alt={author.name}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="pt-16 px-6 pb-6"
        >
          <h2 className="text-2xl font-bold mb-1">{author.name}</h2>
          <p className="text-muted-foreground">Content Creator & Writer</p>
          
          <div className="flex items-center gap-4 mt-4 mb-6">
            <div className="text-center">
              <p className="text-xl font-bold">42</p>
              <p className="text-xs text-muted-foreground">Articles</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">15.2k</p>
              <p className="text-xs text-muted-foreground">Readers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">4.8</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </div>
          
          <h3 className="font-medium mb-2">About</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Professional content creator specializing in technology, science, and digital trends. 
            With over 5 years of experience in content creation and a passion for making complex topics accessible.
          </p>
          
          <h3 className="font-medium mb-2">Connect</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9 text-[#1DA1F2]">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9 text-[#1877F2]">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9 text-[#0A66C2]">
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9 text-[#25D366]">
              <WhatsApp className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

const Article = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const { isBookmarked, toggleBookmark, maxBookmarksReached } = useBookmarks();
  const viewCountedRef = useRef(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (slug) {
      fetchArticle(slug);
      viewCountedRef.current = false;
    }
    window.scrollTo(0, 0);
  }, [slug]);

  const incrementViewCount = async (articleId: string) => {
    if (viewCountedRef.current) return;
    
    try {
      const { error } = await supabase.rpc('increment_view_count', { article_id: articleId });
      
      if (error) {
        console.error("Error incrementing view count:", error);
      } else {
        viewCountedRef.current = true;
      }
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

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
        
        incrementViewCount(data.id);
        
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
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(article!.title + ' ' + url)}`;
        break;
      default:
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
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-primary mb-6"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row gap-8"
          >
            <div className="w-full lg:w-3/4">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {article.category}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.viewCount} views
                  </Badge>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {article.title}
                </h1>

                <div className="relative p-6 rounded-xl bg-gradient-to-r from-purple-50/50 to-background border border-purple-100/50 dark:from-purple-950/10 dark:to-background dark:border-purple-900/20 mb-8">
                  <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-3xl opacity-50 z-0"></div>
                  
                  <div className="flex flex-col gap-4 relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted ring-2 ring-primary/20">
                          <img 
                            src={article.author.avatar} 
                            alt={article.author.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{article.author.name}</div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <User className="h-3 w-3 mr-1" />
                            Author
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant={isBookmarked(article.id) ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "rounded-full gap-1",
                            isBookmarked(article.id) && "bg-gradient-to-r from-primary to-purple-500 text-white"
                          )}
                          onClick={() => toggleBookmark(article)}
                          disabled={maxBookmarksReached && !isBookmarked(article.id)}
                          title={maxBookmarksReached && !isBookmarked(article.id) ? "Maximum bookmarks reached" : ""}
                        >
                          <Bookmark className={`h-4 w-4 ${isBookmarked(article.id) ? "fill-white text-white" : ""}`} />
                          <span className={isMobile ? "sr-only" : ""}>{isBookmarked(article.id) ? "Saved" : "Save"}</span>
                        </Button>
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-full gap-1">
                              <Share2 className="h-4 w-4" />
                              <span className={isMobile ? "sr-only" : ""}>Share</span>
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
                                className="rounded-full text-[#25D366] hover:bg-[#25D366]/10"
                                onClick={() => handleShare('whatsapp')}
                              >
                                <WhatsApp className="h-4 w-4" />
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
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground rounded-full bg-muted/50 px-4 py-1.5 w-fit">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary/70" />
                        <span>{article.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary/70" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="aspect-[21/9] w-full overflow-hidden rounded-xl shadow-md mb-10 bg-gradient-to-r from-primary/10 to-purple-500/10 p-1">
                <div className="w-full h-full rounded-lg overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div 
                ref={contentRef}
                className="prose prose-slate dark:prose-invert max-w-none prose-img:rounded-lg prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-headings:scroll-m-20 prose-p:leading-7 prose-blockquote:border-l-primary/50 prose-pre:bg-muted"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {article.tags && article.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h4 className="text-sm font-medium mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary border-primary/20">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Button 
                    variant={isBookmarked(article.id) ? "default" : "outline"}
                    size="sm" 
                    className={cn(
                      "rounded-full gap-2",
                      isBookmarked(article.id) && "bg-gradient-to-r from-primary to-purple-500 text-white"
                    )}
                    onClick={() => toggleBookmark(article)}
                    disabled={maxBookmarksReached && !isBookmarked(article.id)}
                    title={maxBookmarksReached && !isBookmarked(article.id) ? "Maximum bookmarks reached" : ""}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked(article.id) ? "fill-white text-white" : ""}`} />
                    {isBookmarked(article.id) ? "Saved to Reading List" : "Save to Reading List"}
                  </Button>
                  
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
                      <WhatsApp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/4 space-y-6">
              <TableOfContents contentRef={contentRef} className="hidden lg:block sticky top-24" />
              
              <div className="rounded-xl border bg-gradient-to-r from-purple-50/50 to-background dark:from-purple-950/10 dark:to-background shadow-sm p-6 sticky top-80 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-3xl opacity-70 z-0"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-muted ring-2 ring-primary/20">
                      <img 
                        src={article.author.avatar} 
                        alt={article.author.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{article.author.name}</div>
                      <div className="text-sm text-muted-foreground">Content Creator</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold">42</p>
                      <p className="text-xs text-muted-foreground">Articles</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">15.2k</p>
                      <p className="text-xs text-muted-foreground">Readers</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">4.8</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    Content creator specializing in {article.category} and related topics with expertise in digital media and content strategy.
                  </p>
                  
                  <AuthorProfile author={article.author} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Article;

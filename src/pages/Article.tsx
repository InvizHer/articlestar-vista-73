
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { DbArticle } from "@/types/database";
import { Article as ArticleType } from "@/types/blog";
import { 
  CalendarIcon, 
  Clock, 
  ChevronLeft, 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Eye, 
  MessageSquare,
  Copy,
  ArrowLeft,
  ArrowRight,
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/hooks/use-theme";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Comments from "@/components/blog/Comments";
import LikeButton from "@/components/blog/LikeButton";

// WhatsApp Icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

// Reading Progress Bar
const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const updateReadingProgress = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setProgress(Number((currentProgress / scrollHeight).toFixed(2)) * 100);
      }
    };
    
    window.addEventListener('scroll', updateReadingProgress);
    
    return () => {
      window.removeEventListener('scroll', updateReadingProgress);
    };
  }, []);
  
  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div 
        className="h-full bg-primary transition-all duration-150" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

// Share Button Component
const ShareButton = ({ article }: { article: ArticleType }) => {
  // Handle share functionality
  const handleShare = (platform: string) => {
    const url = window.location.href;
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(article.title)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
        return;
      default:
        navigator.share({
          title: article.title,
          url: url
        }).catch(() => {
          navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard");
        });
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
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
            <WhatsAppIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => handleShare('copy')}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Main Article Component
const Article = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const viewCountedRef = useRef(false);
  const isMobile = useIsMobile();
  const { themeColor } = useTheme();

  // Function to convert database article to article type
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

  // Effect to fetch article data
  useEffect(() => {
    if (slug) {
      fetchArticle(slug);
      viewCountedRef.current = false;
    }
    window.scrollTo(0, 0);
  }, [slug]);

  // Increment view count
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

  // Fetch article data
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

  // Loading state UI
  if (loading) {
    return (
      <Layout>
        <ReadingProgressBar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
          <div className="animate-pulse space-y-8 w-full max-w-3xl mx-auto">
            <div className="h-8 bg-muted rounded w-2/3 mx-auto"></div>
            <div className="h-[300px] bg-muted rounded-xl w-full"></div>
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

  // Get theme color for badges
  const getBadgeClass = () => {
    switch(themeColor) {
      case 'blue':
        return 'bg-blue-500';
      case 'purple':
        return 'bg-purple-500';
      case 'green':
        return 'bg-green-500';
      case 'orange':
        return 'bg-orange-500';
      case 'pink':
        return 'bg-pink-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Layout>
      <ReadingProgressBar />
      
      {/* Article Header */}
      <div className="w-full bg-gradient-to-b from-muted/50 to-background pt-6 pb-4 -mt-6">
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className={isMobile ? "sr-only" : ""}>Back</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto px-4 py-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main content */}
          <div className="w-full">
            <div className="mb-6">
              <Badge 
                className={cn(
                  getBadgeClass(), 
                  "text-white border-none mb-4"
                )}
              >
                {article.category}
              </Badge>

              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{article.author.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{article.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{article.readTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{article.viewCount} views</span>
                </div>
              </div>
            </div>

            {/* Cover image */}
            <div className="rounded-xl overflow-hidden mb-8 shadow-md">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-auto object-cover aspect-video"
              />
            </div>

            {/* Article content */}
            <div 
              ref={contentRef}
              className="prose prose-slate dark:prose-invert max-w-none mb-8 prose-img:rounded-lg prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-p:leading-7"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-medium mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="rounded-md">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive action bar */}
            <div className="flex items-center justify-between py-3 border-y mb-8">
              <div className="flex items-center gap-4">
                <LikeButton articleId={article.id} size="sm" />
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Comments</span>
                </Button>
              </div>
              
              <ShareButton article={article} />
            </div>

            {/* Comments Section */}
            <Comments articleId={article.id} />
            
            {/* Article navigation */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link 
                to={`/articles`} 
                className="group p-4 border rounded-xl flex items-center gap-3 hover:bg-muted/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted group-hover:bg-background transition-colors">
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Previous</span>
                  <span className="font-medium">Back to Articles</span>
                </div>
              </Link>
              
              <div className="p-4 border rounded-xl flex items-center justify-end gap-3 text-right">
                <div>
                  <span className="text-xs text-muted-foreground block">Thank you</span>
                  <span className="font-medium line-clamp-1">For reading this article</span>
                </div>
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Article;

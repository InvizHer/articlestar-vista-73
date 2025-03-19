
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
  WhatsappIcon
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Author Profile Dialog Component
const AuthorProfile = ({ author }: { author: ArticleType['author'] }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full rounded-full">
          View Author Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl">
        <div className="h-28 bg-gradient-to-r from-primary/80 to-primary/50 relative">
          <div className="absolute -bottom-12 left-6 w-24 h-24 rounded-full border-4 border-background overflow-hidden shadow-md">
            <img 
              src={author.avatar} 
              alt={author.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="pt-16 px-6 pb-6">
          <h2 className="text-2xl font-bold mb-1">{author.name}</h2>
          <p className="text-muted-foreground">Content Creator & Writer</p>
          
          <div className="flex items-center gap-4 mt-4 mb-6">
            <div className="text-center">
              <p className="text-lg font-bold">42</p>
              <p className="text-xs text-muted-foreground">Articles</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">15.2k</p>
              <p className="text-xs text-muted-foreground">Readers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">4.8</p>
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
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
              <WhatsAppIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Related Article Card Component
const RelatedArticleCard = ({ article }: { article: Partial<ArticleType> }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="group"
  >
    <Link to={`/article/${article.slug}`} className="flex gap-3 items-center rounded-lg overflow-hidden">
      <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
        <img
          src={article.coverImage}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          {article.date}
        </p>
      </div>
    </Link>
  </motion.div>
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
  const [relatedArticles, setRelatedArticles] = useState<Partial<ArticleType>[]>([]);
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
        
        // Fetch related articles (mock data for now)
        fetchRelatedArticles(data.category);
        
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

  // Fetch related articles
  const fetchRelatedArticles = async (category: string) => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, cover_image, date")
        .eq("category", category)
        .eq("published", true)
        .neq("slug", slug)
        .limit(4);

      if (error) {
        throw error;
      }

      if (data) {
        const formattedArticles = data.map(article => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          coverImage: article.cover_image || "/placeholder.svg",
          date: new Date(article.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })
        }));
        setRelatedArticles(formattedArticles);
      }
    } catch (error) {
      console.error("Error fetching related articles:", error);
    }
  };

  // Loading state UI
  if (loading) {
    return (
      <Layout>
        <ReadingProgressBar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
          <div className="animate-pulse space-y-8 w-full max-w-3xl">
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
        <div className="max-w-5xl mx-auto px-4">
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
      
      <div className="max-w-5xl mx-auto px-4 py-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row gap-8 lg:gap-12"
        >
          {/* Main content */}
          <div className="w-full lg:w-2/3">
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
              
              {/* Replace BookmarkPlus with Share button */}
              <ShareButton article={article} />
            </div>
            
            {/* Author box for mobile (moved to bottom) */}
            <div className="block lg:hidden mb-8">
              <AuthorCard author={article.author} themeColor={themeColor} />
            </div>

            {/* Comments Section */}
            <Comments articleId={article.id} />
            
            {/* Related Articles for Mobile */}
            {isMobile && relatedArticles.length > 0 && (
              <div className="mt-10 pt-6 border-t">
                <h3 className="font-bold text-xl mb-4">Related Articles</h3>
                <div className="grid grid-cols-1 gap-4">
                  {relatedArticles.slice(0, 3).map((article, idx) => (
                    <RelatedArticleCard key={idx} article={article} />
                  ))}
                </div>
              </div>
            )}
            
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
              
              {relatedArticles.length > 0 && (
                <Link 
                  to={`/article/${relatedArticles[0].slug}`} 
                  className="group p-4 border rounded-xl flex items-center justify-end gap-3 text-right hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <span className="text-xs text-muted-foreground block">Next</span>
                    <span className="font-medium line-clamp-1">{relatedArticles[0].title}</span>
                  </div>
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted group-hover:bg-background transition-colors">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              )}
            </div>
          </div>
          
          {/* Sidebar with increased spacing */}
          <div className="w-full lg:w-1/3 space-y-8 lg:pl-4">
            {/* Author Card (desktop) */}
            <div className="hidden lg:block sticky top-24">
              <AuthorCard author={article.author} themeColor={themeColor} />
            </div>
            
            {/* Table of Contents */}
            <div className="hidden lg:block sticky top-[280px]">
              <TableOfContents contentRef={contentRef} />
            </div>
            
            {/* Related Articles */}
            {!isMobile && relatedArticles.length > 0 && (
              <div className="hidden lg:block sticky top-[440px]">
                <div className="rounded-xl border p-5 bg-card">
                  <h3 className="font-bold text-lg mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedArticles.map((article, idx) => (
                      <RelatedArticleCard key={idx} article={article} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

// Author Card Component (extracted from main component)
const AuthorCard = ({ 
  author, 
  themeColor 
}: { 
  author: ArticleType['author'], 
  themeColor: string 
}) => {
  return (
    <div className="rounded-xl border bg-card p-5 mb-6 lg:mb-0 relative overflow-hidden">
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-${themeColor}-500/10 blur-3xl opacity-50 z-0`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20">
            <img 
              src={author.avatar} 
              alt={author.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-bold text-lg">{author.name}</div>
            <div className="text-sm text-muted-foreground">Content Creator</div>
          </div>
        </div>
        
        <Tabs defaultValue="about">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
            <TabsTrigger value="stats" className="flex-1">Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Content creator specializing in technology, science, and digital trends with expertise in making complex topics accessible.
            </p>
            
            <AuthorProfile author={author} />
          </TabsContent>
          
          <TabsContent value="stats" className="pt-2">
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <p className="font-bold text-xl">42</p>
                <p className="text-xs text-muted-foreground">Articles</p>
              </div>
              <div>
                <p className="font-bold text-xl">15.2k</p>
                <p className="text-xs text-muted-foreground">Readers</p>
              </div>
              <div>
                <p className="font-bold text-xl">4.8</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Article;

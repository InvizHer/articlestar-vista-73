
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { DbArticle } from "@/types/database";
import { Article } from "@/types/blog";
import { 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Search,
  Hash,
  ExternalLink,
  Eye,
  Github,
  Mail,
  BookOpen,
  CalendarDays,
  Bookmark,
  MessageCircle,
  Award,
  ChevronRight,
  Star,
  ScrollText,
  Rss
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Hero from "@/components/common/Hero";
import ArticleGrid from "@/components/blog/ArticleGrid";
import FeaturedArticle from "@/components/blog/FeaturedArticle";

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
    coverImage: dbArticle.cover_image || "/placeholder.svg",
    viewCount: dbArticle.view_count || 0
  };
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string, color: string }) => (
  <Card className="overflow-hidden hover:shadow-md transition-all duration-300 group">
    <CardContent className="p-6 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-full ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const TextWithHighlight = ({ text, highlighted }: { text: string, highlighted: string }) => {
  const parts = text.split(new RegExp(`(${highlighted})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlighted.toLowerCase() ? 
          <span key={i} className="bg-primary/20 text-primary px-1 rounded">{part}</span> : 
          <span key={i}>{part}</span>
      )}
    </>
  );
};

// Animated counter hook
const useCountUp = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      countRef.current = Math.floor(progress * end);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };
    
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
};

const Index = () => {
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [popularCategories, setPopularCategories] = useState<{name: string, count: number}[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  // Animated stats
  const totalArticles = useCountUp(100);
  const totalAuthors = useCountUp(25);
  const totalViews = useCountUp(15000);
  
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
        .limit(7);

      if (error) throw error;

      const articles = (data || []).map(convertDbArticleToArticle);
      setRecentArticles(articles);
      
      const categoryCount: {[key: string]: number} = {};
      articles.forEach(article => {
        if (article.category) {
          categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
        }
      });
      
      const sortedCategories = Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setPopularCategories(sortedCategories);
      
      const allTags = articles.flatMap(article => article.tags || []);
      const uniqueTags = [...new Set(allTags)].slice(0, 6);
      setTrendingTags(uniqueTags);
      
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/articles?search=${encodeURIComponent(searchInput)}`;
    }
  };
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
        toast.success("Thanks for subscribing to our newsletter!");
        setNewsletterEmail("");
      } else {
        toast.error("Please enter a valid email address");
      }
      setIsSubmitting(false);
    }, 1000);
  };

  const featuredArticle = recentArticles[0];
  const recentArticlesToShow = recentArticles.slice(1, 7);

  return (
    <Layout fullWidth>
      <Hero
        title="Discover Stories that Inspire & Inform"
        subtitle="Explore thought-provoking articles on technology, design, and culture that shape our digital landscape."
        ctaText="Start Reading"
        ctaLink="/articles"
      />
      
      <motion.div 
        style={{ opacity }}
        className="fixed bottom-8 right-8 z-50 hidden lg:block"
      >
        <Button 
          size="icon" 
          className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white hover:scale-110 transition-all duration-300"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowRight className="h-5 w-5 -rotate-90" />
        </Button>
      </motion.div>
      
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <StatCard 
              icon={ScrollText}
              label="Total Articles"
              value={totalArticles.toString()}
              color="bg-primary"
            />
            <StatCard 
              icon={Star}
              label="Total Categories"
              value={popularCategories.length.toString()}
              color="bg-blue-500"
            />
            <StatCard 
              icon={Award}
              label="Featured Authors"
              value={totalAuthors.toString()}
              color="bg-orange-500"
            />
            <StatCard 
              icon={Eye}
              label="Total Article Views"
              value={`${Math.floor(totalViews / 1000)}k+`}
              color="bg-green-500"
            />
          </div>
          
          <div className="max-w-xl mx-auto relative mb-10">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for articles, topics or keywords..."
                  className="pl-10 py-6 pr-4 rounded-l-full border-r-0 shadow-lg focus-visible:ring-primary/50"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="rounded-r-full h-12 px-6 shadow-lg"
              >
                Explore
              </Button>
            </form>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-muted rounded mb-8"></div>
              <div className="h-[400px] w-full bg-muted rounded-xl mb-8"></div>
            </div>
          </div>
        </section>
      ) : featuredArticle ? (
        <section className="py-20 bg-gradient-radial from-primary/5 via-background to-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-12 flex flex-col items-center text-center"
            >
              <Badge className="mb-4 bg-primary/10 text-primary py-1 px-4 rounded-full">
                <Star className="h-3.5 w-3.5 mr-1.5" fill="currentColor" /> Editor's Pick
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Highlighted Article</h2>
              <div className="w-20 h-1.5 bg-primary rounded-full mb-4"></div>
              <p className="text-muted-foreground max-w-lg text-center">
                Our editors handpick the most insightful and thought-provoking stories for you
              </p>
            </motion.div>
            
            <FeaturedArticle article={featuredArticle} />
          </div>
        </section>
      ) : null}

      {loading ? (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-muted rounded mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : recentArticlesToShow.length > 0 ? (
        <section className="py-20 bg-gradient-to-b from-background to-primary/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-12 flex flex-col md:flex-row md:items-center justify-between"
            >
              <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
                <Badge className="mb-4 bg-blue-500/10 text-blue-500 py-1 px-4 rounded-full">
                  <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Latest Articles
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center md:text-left">Fresh Stories</h2>
                <div className="w-20 h-1.5 bg-blue-500 rounded-full mb-4"></div>
                <p className="text-muted-foreground text-center md:text-left">
                  Explore our newest content from talented authors
                </p>
              </div>
              
              <Button asChild variant="outline" className="group rounded-full shadow-sm">
                <Link to="/articles" className="gap-2">
                  View All Articles
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
            
            <ArticleGrid articles={recentArticlesToShow} columns={3} />
          </div>
        </section>
      ) : null}

      <section className="py-20 bg-gradient-to-t from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary py-1 px-4 rounded-full">
              <Hash className="h-3.5 w-3.5 mr-1.5" /> Browse By Interest
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Categories</h2>
            <div className="w-20 h-1.5 bg-primary mx-auto rounded-full mb-4"></div>
            <p className="text-muted-foreground">
              Find content tailored to your interests across our diverse catalog
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link 
                  to={`/articles?category=${category.name}`}
                  className="group block h-full"
                >
                  <Card className="overflow-hidden h-full border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 left-0 h-full w-1.5 bg-primary transform origin-left group-hover:scale-y-105 transition-transform duration-300"></div>
                    <CardHeader className="pb-3">
                      <Badge className="w-fit mb-2 bg-primary/10 text-primary">Category</Badge>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground">
                        {category.count} article{category.count !== 1 ? 's' : ''}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <span className="text-sm text-primary flex items-center group-hover:translate-x-1 transition-transform duration-300">
                        Explore category
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          
          {trendingTags.length > 0 && (
            <div className="mt-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center mb-8"
              >
                <Badge className="mb-4 bg-blue-500/10 text-blue-500 py-1 px-4 rounded-full">
                  <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Trending Now
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Popular Topics</h3>
                <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full mb-4"></div>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Discover what others are reading and discussing right now
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="flex flex-wrap justify-center gap-3"
              >
                {trendingTags.map((tag, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link 
                      to={`/articles?tag=${tag}`}
                      className="flex items-center rounded-full px-4 py-2 text-sm font-medium bg-card hover:bg-primary/10 border hover:border-primary/30 transition-colors hover:scale-105 transform shadow-sm"
                    >
                      <Hash className="h-3.5 w-3.5 mr-1.5 text-primary" />
                      {tag}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.15),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(var(--primary),0.15),transparent_70%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-card rounded-2xl overflow-hidden shadow-xl border border-primary/10">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-gradient-to-br from-primary to-purple-600 p-8 md:p-10 text-white">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Badge className="bg-white/20 text-white mb-6 backdrop-blur-sm">
                    <Rss className="h-3.5 w-3.5 mr-1.5" /> Stay Updated
                  </Badge>
                  <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
                  <p className="text-white/80 mb-6">
                    Get the latest articles, features, and news delivered straight to your inbox. No spam, only quality content.
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>Weekly digests of top stories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>Exclusive content not on the blog</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>Unsubscribe anytime</span>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="p-8 md:p-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-semibold mb-2">Join 5,000+ subscribers</h3>
                  <p className="text-muted-foreground mb-6">
                    Fill in your details below to join our subscriber list
                  </p>
                  
                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="Your email address"
                        className="h-12 shadow-sm"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 shadow-md"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Subscribing..." : "Subscribe to Newsletter"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      By subscribing, you agree to our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> 
                      and consent to receive updates from our company.
                    </p>
                  </form>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-t from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary py-1 px-4 rounded-full">
              <MessageCircle className="h-3.5 w-3.5 mr-1.5" /> Join The Community
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Connect With Us</h2>
            <div className="w-20 h-1.5 bg-primary mx-auto rounded-full mb-4"></div>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Connect with fellow readers and writers, join discussions, and share your ideas
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden border-primary/10 hover:border-primary/30 group-hover:transform group-hover:scale-[1.01]">
                <CardHeader className="pb-2">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Github className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">GitHub Discussions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Join our open source community on GitHub to contribute and help improve our platform.
                  </p>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary font-medium group-hover:underline"
                  >
                    <Github className="h-4 w-4" />
                    <span>Visit GitHub</span>
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden border-primary/10 hover:border-primary/30 group-hover:transform group-hover:scale-[1.01]">
                <CardHeader className="pb-2">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Get In Touch</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Have questions, feedback, or want to contribute? Reach out to our team directly.
                  </p>
                  <Link 
                    to="/contact"
                    className="inline-flex items-center gap-2 text-primary font-medium group-hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Contact Us</span>
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

const Check = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default Index;

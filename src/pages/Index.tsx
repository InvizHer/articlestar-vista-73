import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { DbArticle } from "@/types/database";
import { Article } from "@/types/blog";
import { 
  ArrowRight, 
  Sparkles, 
  Search,
  ExternalLink,
  Eye,
  Clock,
  Instagram,
  Github,
  Linkedin,
  Youtube
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import EditorsPick from "@/components/blog/EditorsPick";
import ArticleGrid from "@/components/blog/ArticleGrid";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

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

const Index = () => {
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [popularCategories, setPopularCategories] = useState<{name: string, count: number}[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

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

  const featuredArticle = recentArticles[0];
  const recentArticlesToShow = recentArticles.slice(1, 7);

  const socialMediaLinks = [
    {
      name: "Instagram",
      icon: <Instagram className="h-5 w-5" />,
      url: "https://instagram.com",
      gradient: "from-pink-500 to-orange-400",
      hoverEffect: "group-hover:scale-110"
    },
    {
      name: "GitHub",
      icon: <Github className="h-5 w-5" />,
      url: "https://github.com",
      gradient: "from-slate-900 to-slate-700",
      hoverEffect: "group-hover:rotate-12"
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      url: "https://linkedin.com",
      gradient: "from-blue-600 to-blue-400",
      hoverEffect: "group-hover:scale-110"
    },
    {
      name: "YouTube",
      icon: <Youtube className="h-5 w-5" />,
      url: "https://youtube.com",
      gradient: "from-red-600 to-red-500",
      hoverEffect: "group-hover:scale-110"
    }
  ];

  const isMobile = useIsMobile();

  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-[30%] -right-[20%] h-[500px] w-[500px] rounded-full bg-primary/5"></div>
          <div className="absolute -bottom-[10%] -left-[10%] h-[300px] w-[300px] rounded-full bg-blue-500/5"></div>
          <div className="absolute top-[20%] left-[15%] h-[200px] w-[200px] rounded-full bg-purple-500/5"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Modern Digital Journal
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Discover Stories that 
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"> Inspire</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 mx-auto max-w-2xl">
              Explore thought-provoking articles on design, technology, and culture that shape our digital landscape.
            </p>
            
            <div className="max-w-lg mx-auto relative">
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative flex-grow">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    className="pl-10 py-6 pr-4 rounded-l-full border-r-0 bg-background/80 backdrop-blur-sm focus-visible:ring-primary/50"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <Button type="submit" className="rounded-r-full h-12 px-5">
                  Explore
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path 
              fill="currentColor" 
              fillOpacity="0.05"
              d="M0,96L60,85.3C120,75,240,53,360,48C480,43,600,53,720,69.3C840,85,960,107,1080,101.3C1200,96,1320,64,1380,48L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {loading ? (
        <section className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-8"></div>
            <div className="h-64 md:h-80 w-full bg-muted rounded-xl mb-8"></div>
          </div>
        </section>
      ) : featuredArticle ? (
        <section className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-10 flex items-center"
          >
            <div className="h-12 w-1.5 bg-primary rounded-full mr-4"></div>
            <div>
              <h2 className="text-3xl font-bold">Editor's Pick</h2>
              <p className="text-muted-foreground mt-1">Our featured story this week</p>
            </div>
          </motion.div>
          
          <EditorsPick article={featuredArticle} />
        </section>
      ) : null}

      {loading ? (
        <section className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </section>
      ) : recentArticlesToShow.length > 0 ? (
        <section className="container mx-auto px-4 py-12 bg-gradient-to-b from-background to-primary/5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-10 flex flex-col md:flex-row md:items-center justify-between"
          >
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-12 w-1.5 bg-blue-500 rounded-full mr-4"></div>
              <div>
                <h2 className="text-3xl font-bold">Recent Stories</h2>
                <p className="text-muted-foreground mt-1">Fresh content from our authors</p>
              </div>
            </div>
            
            <Button asChild variant="outline" className="group">
              <Link to="/articles" className="gap-2">
                View All Articles
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticlesToShow.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link 
                  to={`/article/${article.slug}`}
                  className="group flex flex-col h-full rounded-xl overflow-hidden bg-card border shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <img 
                      src={article.coverImage} 
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>
                    
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm">
                        {article.category}
                      </div>
                      
                      <div className="bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.viewCount}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow bg-gradient-to-br from-card to-primary/5">
                    <div className="flex items-center mb-3 text-xs text-muted-foreground">
                      <span>{article.date}</span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full overflow-hidden mr-2 border border-primary/20">
                          <img 
                            src={article.author.avatar} 
                            alt={article.author.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs">{article.author.name}</span>
                      </div>
                      
                      <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/articles" className="gap-2">
                View All Articles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      ) : null}

      <section className="py-16 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent mb-4">Connect With Us</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Follow us on social media to stay updated with the latest content
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {socialMediaLinks.map((social, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                    <div className={`absolute inset-0 bg-gradient-to-br ${social.gradient}`}></div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <div className={`bg-white/20 rounded-full p-3 mb-2 transition-transform duration-300 ${social.hoverEffect}`}>
                        {social.icon}
                      </div>
                      <span className="font-medium text-sm sm:text-base">{social.name}</span>
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

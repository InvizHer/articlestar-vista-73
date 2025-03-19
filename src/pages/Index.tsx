
import React, { useRef, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Hero from "@/components/common/Hero";
import ArticleGrid from "@/components/blog/ArticleGrid";
import { articles } from "@/data/articles";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Award, 
  Github,
  Mail,
  Sparkles,
  Heart,
  Star,
  Globe,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import CategoryBadge from "@/components/blog/CategoryBadge";
import ScrollToTop from "@/components/common/ScrollToTop";

// Get top categories
const categories = [...new Set(articles.map(article => article.category))]
  .filter(Boolean)
  .slice(0, 6)
  .map(category => ({
    name: category as string,
    count: articles.filter(a => a.category === category).length
  }));

// Get all tags
const tags = Array.from(
  new Set(
    articles.flatMap(article => article.tags || [])
  )
).slice(0, 12);

// Featured and latest articles
const featuredArticle = articles.find(article => article.featured) || articles[0];
const latestArticles = articles.filter(article => article.id !== featuredArticle.id).slice(0, 6);
const popularArticles = [...articles]
  .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
  .slice(0, 3);
const editorPicks = articles.filter(article => article.editorPick).slice(0, 3);

const Index: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const bannerRef = useRef<HTMLDivElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);
  const newsletterInView = useInView(newsletterRef, { once: true, amount: 0.5 });
  
  const statCounters = [
    { icon: BookOpen, label: "Articles", value: articles.length, suffix: "+", color: "text-primary" },
    { icon: Users, label: "Readers", value: 12500, suffix: "+", color: "text-purple-500" },
    { icon: Award, label: "Awards", value: 17, suffix: "", color: "text-pink-500" }
  ];
  
  // Parallax effect for banner
  useEffect(() => {
    const handleScroll = () => {
      if (!bannerRef.current) return;
      const scrollPosition = window.scrollY;
      const bannerElement = bannerRef.current;
      const bannerOffset = bannerElement.offsetTop;
      const distance = scrollPosition - bannerOffset;
      
      if (distance > -window.innerHeight && distance < window.innerHeight) {
        const parallaxElements = bannerElement.querySelectorAll('.parallax');
        parallaxElements.forEach((el, index) => {
          const speed = index % 2 === 0 ? 0.1 : -0.1;
          const yPos = distance * speed;
          (el as HTMLElement).style.transform = `translateY(${yPos}px)`;
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Create progress animations for stats
  const CounterAnimation = ({ value, delay = 0 }: { value: number, delay?: number }) => {
    const [count, setCount] = React.useState(0);
    
    React.useEffect(() => {
      if (!statsInView) return;
      
      let start: number;
      const totalDuration = 2000; // 2 seconds
      
      setTimeout(() => {
        const step = (timestamp: number) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / totalDuration, 1);
          setCount(Math.floor(progress * value));
          
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        
        window.requestAnimationFrame(step);
      }, delay);
    }, [statsInView, value, delay]);
    
    return <span>{count}</span>;
  };
  
  return (
    <Layout fullWidth>
      <ScrollToTop />
      
      {/* Hero Section */}
      <Hero 
        title="Discover Stories That Matter"
        subtitle="Immerse yourself in a collection of thought-provoking articles, expert insights, and captivating narratives crafted to inspire and inform."
        ctaText="Start Reading"
        ctaLink="/articles"
      />
      
      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-primary/5">
        <div 
          ref={statsRef}
          className="max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {statCounters.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 50 
                }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow relative overflow-hidden group"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="flex items-center justify-center flex-col text-center relative z-10">
                  <stat.icon className={cn("h-10 w-10 mb-4", stat.color)} />
                  <div className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    <CounterAnimation value={stat.value} delay={index * 200} />
                    {stat.suffix}
                  </div>
                  <p className="text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Article */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1 text-sm mb-4">
              Featured Story
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Editor's Selection
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our curated pick that deserves your attention
            </p>
            <div className="mt-6 w-24 h-1 bg-gradient-to-r from-primary to-purple-600 rounded-full mx-auto"></div>
          </motion.div>
          
          {featuredArticle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="grid md:grid-cols-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="relative aspect-video md:aspect-auto overflow-hidden">
                  <img 
                    src={featuredArticle.coverImage}
                    alt={featuredArticle.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-black/50 to-transparent"></div>
                  
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className="bg-primary/90 hover:bg-primary text-white border-0 shadow-md">
                      {featuredArticle.category}
                    </Badge>
                    
                    <Badge variant="outline" className="bg-black/40 text-white backdrop-blur-sm flex items-center gap-1 border-white/20">
                      <Heart className="h-3 w-3" />
                      Editor's Choice
                    </Badge>
                  </div>
                  
                  <div className="absolute inset-0 flex flex-col justify-center md:p-10 p-6">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-md drop-shadow-md">
                      {featuredArticle.title}
                    </h2>
                    
                    <p className="text-white/90 mb-6 max-w-md line-clamp-3 drop-shadow-md">
                      {featuredArticle.excerpt}
                    </p>
                    
                    <Button 
                      asChild 
                      className="w-fit md:flex hidden rounded-full shadow-lg bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300"
                    >
                      <Link to={`/article/${featuredArticle.slug}`} className="gap-2">
                        Read Article
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                
                <div className="p-6 md:p-10 flex flex-col">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full border-2 border-primary/20 overflow-hidden mr-4">
                      <img 
                        src={featuredArticle.author.avatar} 
                        alt={featuredArticle.author.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{featuredArticle.author.name}</h3>
                      <p className="text-sm text-muted-foreground">{featuredArticle.date}</p>
                    </div>
                  </div>
                  
                  <div className="md:hidden mb-6">
                    <h2 className="text-2xl font-bold mb-2">{featuredArticle.title}</h2>
                    <p className="text-muted-foreground line-clamp-3">{featuredArticle.excerpt}</p>
                  </div>
                  
                  <div className="space-y-4 mb-6 border-l-4 border-primary/30 pl-4 md:block hidden">
                    <h3 className="text-xl font-semibold">Why it matters</h3>
                    <p className="text-muted-foreground">
                      This featured article explores key insights that can transform your understanding 
                      and perspective. It's been selected by our editorial team for its depth,
                      relevance, and impact.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredArticle.tags?.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-primary/5 hover:bg-primary/10 border-primary/20">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="mt-auto">
                    <Button asChild className="rounded-full gap-2 shadow-md w-full md:w-auto">
                      <Link to={`/article/${featuredArticle.slug}`}>
                        Read Complete Article
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-[100px] opacity-60"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-[100px] opacity-60"></div>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1 text-sm mb-4">
              Browse By Topic
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Popular Categories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Explore our diverse range of topics
            </p>
            <div className="mt-6 w-24 h-1 bg-gradient-to-r from-primary to-purple-600 rounded-full mx-auto"></div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
          >
            {categories.map((category, i) => (
              <motion.div 
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Link
                  to={`/articles?category=${category.name}`}
                  className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 h-full group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} articles</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-center mt-10"
          >
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/articles" className="gap-2">
                View All Categories
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Latest Articles */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ArticleGrid 
            articles={latestArticles} 
            columns={3} 
            heading="Latest Articles"
            subheading="Stay up to date with our most recent publications"
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mt-12"
          >
            <Button asChild className="rounded-full">
              <Link to="/articles" className="gap-2">
                View All Articles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Popular Tags */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1 text-sm mb-4">
              Discover By Tag
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Popular Tags
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Find content by specific topics
            </p>
            <div className="mt-6 w-24 h-1 bg-gradient-to-r from-primary to-purple-600 rounded-full mx-auto"></div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {tags.map((tag, i) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: i * 0.07,
                  type: "spring",
                  stiffness: 100 
                }}
                whileHover={{ y: -3, scale: 1.05, transition: { duration: 0.2 } }}
              >
                <Link to={`/articles?tag=${tag}`}>
                  <Badge 
                    variant="outline" 
                    className="px-4 py-2 text-base bg-white dark:bg-slate-900 shadow-md border-primary/10 hover:border-primary/30 hover:bg-primary/5"
                  >
                    #{tag}
                  </Badge>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Editor's Picks */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ArticleGrid 
            articles={editorPicks} 
            columns={3} 
            variant="editor-pick"
            heading="Editor's Picks"
            subheading="Handpicked content you shouldn't miss"
          />
        </div>
      </section>
      
      {/* Newsletter */}
      <section 
        ref={newsletterRef}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 relative overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[100px] opacity-70"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] opacity-70"></div>
        
        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={newsletterInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-10 shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
            
            <div className="text-center mb-8">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1 text-sm mb-4">
                Stay Updated
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get the latest articles, updates and resources delivered straight to your inbox.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="flex-grow rounded-full px-6 py-6 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
              <Button className="rounded-full px-6 py-6 gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 border-0 shadow-lg hover:shadow-xl transition-all">
                Subscribe
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              We respect your privacy. Unsubscribe at any time.
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Community Banner */}
      <section 
        ref={bannerRef}
        className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          <Link to="https://github.com" target="_blank" rel="noopener noreferrer">
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1618401471353-b98afee0b2eb')] bg-cover bg-center mix-blend-overlay"></div>
              <div className="parallax absolute top-10 left-10 opacity-10">
                <Github className="h-40 w-40 text-white" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-6 flex justify-between items-start">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
                    <Github className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-white/20 text-white border-0">
                    Community
                  </Badge>
                </div>
                
                <h3 className="text-2xl font-bold mb-3">Join Our GitHub Community</h3>
                <p className="text-white/80 mb-6">Contribute to our open source projects, report issues, or star our repository.</p>
                
                <div className="flex items-center text-sm gap-3 text-white/60">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>1.2k Stars</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>230+ Contributors</span>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-2 text-white font-medium">
                  Visit GitHub
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>
          
          <Link to="/contact">
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-primary to-purple-600 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1516387938699-a93567ec168e')] bg-cover bg-center mix-blend-overlay"></div>
              <div className="parallax absolute top-10 right-10 opacity-10">
                <Mail className="h-40 w-40 text-white" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-6 flex justify-between items-start">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-white/20 text-white border-0">
                    Get in touch
                  </Badge>
                </div>
                
                <h3 className="text-2xl font-bold mb-3">Contact Our Team</h3>
                <p className="text-white/80 mb-6">Have questions or feedback? We'd love to hear from you!</p>
                
                <div className="flex items-center text-sm gap-3 text-white/60">
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>Worldwide Support</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>24/7 Response</span>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-2 text-white font-medium">
                  Contact Us
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;


import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, 
  X, 
  Search, 
  Bookmark, 
  ChevronDown, 
  Trash2,
  AlignJustify
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Article } from "@/types/blog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DbArticle } from "@/types/database";
import { 
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Helper function to convert DbArticle to Article
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
    coverImage: dbArticle.cover_image || "/placeholder.svg"
  };
};

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAdmin();

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem('bookmarks');
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
    } catch (error) {
      console.error('Failed to load bookmarks from localStorage:', error);
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Perform search when debouncedSearchTerm changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("published", true)
          .or(`title.ilike.%${debouncedSearchTerm}%,content.ilike.%${debouncedSearchTerm}%`)
          .limit(5);

        if (error) throw error;
        const articles = (data || []).map(convertDbArticleToArticle);
        setSearchResults(articles);
      } catch (error) {
        console.error("Error searching articles:", error);
        setSearchResults([]);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchTerm]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
    toast.success("Bookmark removed");
  };

  const handleSearchOpen = () => {
    setSearchOpen(true);
  };

  const handleSearchSelect = (slug: string) => {
    setSearchOpen(false);
    setSearchTerm("");
    navigate(`/article/${slug}`);
  };

  const handleBookmarkClick = (slug: string) => {
    navigate(`/article/${slug}`);
  };

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-background"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 transition-all duration-300">
                BlogHub
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/" label="Home" />
            <NavLink to="/articles" label="Articles" />
            <NavLink to="/about" label="About" />
            <NavLink to="/contact" label="Contact" />
            {isAuthenticated && (
              <NavLink to="/admin/dashboard" label="Dashboard" />
            )}
            
            {/* Search button */}
            <Button variant="ghost" size="icon" onClick={handleSearchOpen} className="ml-2 text-muted-foreground hover:text-primary">
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Bookmarks button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Bookmark className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <div className="p-4 border-b">
                  <h4 className="font-medium">Your Bookmarks</h4>
                  <p className="text-sm text-muted-foreground">
                    {bookmarks.length === 0 
                      ? "No bookmarks yet" 
                      : `${bookmarks.length} article${bookmarks.length > 1 ? 's' : ''} bookmarked`}
                  </p>
                </div>
                {bookmarks.length > 0 ? (
                  <ScrollArea className="h-[300px] p-4">
                    <div className="space-y-4">
                      {bookmarks.map((bookmark) => (
                        <div key={bookmark.id} className="flex items-start space-x-3 group">
                          <div 
                            className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
                            onClick={() => handleBookmarkClick(bookmark.slug)}
                          >
                            <img 
                              src={bookmark.coverImage} 
                              alt="" 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 
                              className="text-sm font-medium cursor-pointer hover:text-primary truncate"
                              onClick={() => handleBookmarkClick(bookmark.slug)}
                            >
                              {bookmark.title}
                            </h5>
                            <p className="text-xs text-muted-foreground">
                              {bookmark.author.name} • {bookmark.readTime}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={() => removeBookmark(bookmark.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="py-6 px-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Save articles to read later by clicking the bookmark icon on article pages.
                    </p>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSearchOpen}
              className="text-muted-foreground hover:text-primary"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Bookmark className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0">
                <div className="p-3 border-b">
                  <h4 className="font-medium">Bookmarks</h4>
                </div>
                {bookmarks.length > 0 ? (
                  <ScrollArea className="h-[300px] p-3">
                    <div className="space-y-3">
                      {bookmarks.map((bookmark) => (
                        <div key={bookmark.id} className="flex items-start gap-2 group">
                          <div 
                            className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0"
                            onClick={() => handleBookmarkClick(bookmark.slug)}
                          >
                            <img 
                              src={bookmark.coverImage} 
                              alt="" 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 
                              className="text-sm font-medium cursor-pointer hover:text-primary truncate"
                              onClick={() => handleBookmarkClick(bookmark.slug)}
                            >
                              {bookmark.title}
                            </h5>
                            <p className="text-xs text-muted-foreground">
                              {bookmark.readTime}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => removeBookmark(bookmark.id)}
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="py-6 px-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No bookmarks yet
                    </p>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="Menu" 
                  className="text-muted-foreground hover:text-primary"
                >
                  <AlignJustify className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[280px]">
                <div className="py-4 space-y-1">
                  <SheetClose asChild>
                    <MobileNavLink to="/" label="Home" onClick={() => {}} />
                  </SheetClose>
                  <SheetClose asChild>
                    <MobileNavLink to="/articles" label="Articles" onClick={() => {}} />
                  </SheetClose>
                  <SheetClose asChild>
                    <MobileNavLink to="/about" label="About" onClick={() => {}} />
                  </SheetClose>
                  <SheetClose asChild>
                    <MobileNavLink to="/contact" label="Contact" onClick={() => {}} />
                  </SheetClose>
                  {isAuthenticated && (
                    <SheetClose asChild>
                      <MobileNavLink to="/admin/dashboard" label="Dashboard" onClick={() => {}} />
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search command dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput 
          placeholder="Search articles..." 
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Articles">
            {searchResults.map((article) => (
              <CommandItem
                key={article.id}
                onSelect={() => handleSearchSelect(article.slug)}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                  <img 
                    src={article.coverImage} 
                    alt="" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{article.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {article.readTime} • {article.category}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
};

// Desktop nav link component
const NavLink = ({ to, label }: { to: string; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to !== "/" && location.pathname.startsWith(to));
  
  return (
    <Link
      to={to}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors relative group ${
        isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:text-primary"
      }`}
    >
      {label}
      <span 
        className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 ${
          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </Link>
  );
};

// Mobile nav link component
const MobileNavLink = ({ to, label, onClick }: { to: string; label: string; onClick: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to !== "/" && location.pathname.startsWith(to));
  
  return (
    <Link
      to={to}
      className={`block py-2 px-4 text-base font-medium rounded-md transition-colors ${
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-muted hover:text-primary"
      }`}
      onClick={onClick}
    >
      {label}
    </Link>
  );
};

export default Navigation;

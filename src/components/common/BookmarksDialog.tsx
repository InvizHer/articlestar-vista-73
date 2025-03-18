
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBookmarks } from '@/hooks/use-bookmarks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Clock, Trash2, XCircle, Search, X, BookmarkCheck, Eye } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface BookmarksDialogProps {
  className?: string;
}

export function BookmarksDialog({ className }: BookmarksDialogProps) {
  const { bookmarks, removeBookmark, clearBookmarks, maxBookmarksReached } = useBookmarks();
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get unique categories
  const categories = [...new Set(bookmarks.map(article => article.category))];
  
  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? article.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "relative hover:bg-background hover:text-primary transition-all duration-300", 
            className
          )}
        >
          <Bookmark className="h-5 w-5" />
          {bookmarks.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-primary to-purple-500 text-[10px] font-bold text-primary-foreground flex items-center justify-center shadow-md">
              {bookmarks.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-xl border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-background to-purple-50/50 dark:from-background dark:to-purple-950/10 backdrop-blur-sm">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BookmarkCheck className="h-5 w-5 text-primary" />
              My Reading List
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {bookmarks.length} {bookmarks.length === 1 ? 'Article' : 'Articles'}
              </Badge>
              <Badge variant={maxBookmarksReached ? "destructive" : "outline"} className="text-xs">
                {bookmarks.length}/3
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {maxBookmarksReached 
              ? "Maximum bookmarks reached. Remove one to add more." 
              : "Your saved articles for later reading."}
          </DialogDescription>
        </DialogHeader>
        
        {bookmarks.length > 0 && (
          <div className="px-6 pb-3 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search your bookmarks..."
                className="w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  className="text-xs rounded-full h-7"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    className="text-xs rounded-full h-7"
                    onClick={() => setSelectedCategory(prev => prev === category ? null : category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {bookmarks.length === 0 ? (
          <div className="py-12 text-center px-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-primary/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Bookmark className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">No bookmarks yet</p>
              <p className="text-muted-foreground/70 text-sm mt-1">Save articles to read later!</p>
            </motion.div>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[60vh] px-6 py-3">
              <AnimatePresence>
                {filteredBookmarks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-8 text-center"
                  >
                    <XCircle className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No matching bookmarks found</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {filteredBookmarks.map((article, index) => (
                      <motion.div 
                        key={article.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="flex gap-3 p-3 rounded-lg hover:bg-accent/20 transition-colors group relative"
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                          <img 
                            src={article.coverImage} 
                            alt={article.title} 
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="overflow-hidden flex-1">
                          <Link 
                            to={`/article/${article.slug}`}
                            onClick={() => setOpen(false)}
                            className="font-medium text-base line-clamp-2 hover:text-primary group-hover:underline transition-colors"
                          >
                            {article.title}
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{article.readTime}</span>
                            </span>
                            {article.viewCount !== undefined && (
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{article.viewCount} views</span>
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className="mt-2 text-xs font-normal">
                            {article.category}
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeBookmark(article.id)}
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
            
            <div className="flex justify-end p-4 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearBookmarks}
                className="text-xs hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

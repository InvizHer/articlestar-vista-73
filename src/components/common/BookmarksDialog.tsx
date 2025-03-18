import React, { useState, useEffect } from "react";
import { useBookmarks } from "@/hooks/use-bookmarks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, ChevronDown, Clock, MoreHorizontal, Eye, Info, Search, Trash2, X, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const BookmarksDialog = () => {
  const { bookmarks, removeBookmark, clearBookmarks, refreshBookmarks, maxBookmarksReached } = useBookmarks();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [categoryFilter, setCategoryFilter] = useState('');

  const bookmarkCount = bookmarks.length;

  const categories = [...new Set(bookmarks.map(bookmark => bookmark.category))];

  const filteredBookmarks = bookmarks
    .filter(bookmark => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        bookmark.title.toLowerCase().includes(searchTermLower) ||
        bookmark.excerpt?.toLowerCase().includes(searchTermLower) ||
        bookmark.category.toLowerCase().includes(searchTermLower)
      );
    })
    .filter(bookmark => {
      return categoryFilter ? bookmark.category === categoryFilter : true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const handleClearBookmarks = () => {
    clearBookmarks();
    setOpen(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10">
          <Bookmark className="h-5 w-5" />
          {bookmarkCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {bookmarkCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0 rounded-xl border border-purple-200 dark:border-purple-900/50 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/10 to-purple-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="h-5 w-5 text-primary" />
              <DialogTitle>Reading List ({bookmarkCount}/10)</DialogTitle>
            </div>
            
            <div className="bookmark-limit-badge flex items-center gap-2 bg-gradient-to-r from-primary/10 to-purple-500/10 px-3 py-1.5 rounded-full text-xs font-medium">
              <span className={maxBookmarksReached ? "text-destructive" : "text-primary"}>
                {bookmarkCount}/10 articles saved
              </span>
              <Info className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
          <DialogDescription className="sr-only">
            Manage your reading list
          </DialogDescription>
          
          <div className="mt-4 flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search saved articles..."
                className="pl-9 rounded-full bg-background border-primary/20 focus-visible:ring-primary/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 hover:bg-transparent hover:opacity-70"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={refreshBookmarks}
              title="Refresh bookmarks"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setSortOrder('newest')}
                  className="cursor-pointer flex justify-between"
                >
                  Newest First
                  {sortOrder === 'newest' && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortOrder('oldest')}
                  className="cursor-pointer flex justify-between"
                >
                  Oldest First
                  {sortOrder === 'oldest' && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleClearBookmarks}
                  className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear All</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <div
              onClick={() => setCategoryFilter('')} 
              className={cn(
                "text-xs px-2 py-1 rounded-full cursor-pointer transition-colors",
                categoryFilter === '' 
                  ? "bg-primary text-white" 
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
            >
              All
            </div>
            {categories.map((category, index) => (
              <div
                key={index}
                onClick={() => setCategoryFilter(category)} 
                className={cn(
                  "text-xs px-2 py-1 rounded-full cursor-pointer transition-colors",
                  categoryFilter === category 
                    ? "bg-primary text-white" 
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                )}
              >
                {category}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto p-4">
          {filteredBookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                <Bookmark className="h-6 w-6 text-primary" />
              </div>
              {bookmarks.length === 0 ? (
                <div>
                  <h3 className="font-medium text-lg mb-1">No saved articles</h3>
                  <p className="text-muted-foreground text-sm">
                    Articles you save will appear here
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="font-medium text-lg mb-1">No matches found</h3>
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          ) : (
            <AnimatePresence>
              {filteredBookmarks.map((bookmark, index) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="mb-3 p-3 rounded-lg hover:bg-muted/50 transition-colors relative group"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={bookmark.coverImage} 
                        alt={bookmark.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <Link 
                        to={`/article/${bookmark.slug}`} 
                        className="font-medium line-clamp-1 hover:text-primary transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        {bookmark.title}
                      </Link>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{bookmark.readTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{bookmark.viewCount} views</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex gap-2 items-center">
                        <Badge variant="outline" className="bg-primary/5 text-xs px-2 py-0 h-5">
                          {bookmark.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeBookmark(bookmark.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

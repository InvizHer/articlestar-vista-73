
import React, { useState, useEffect } from 'react';
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
import { Bookmark, Clock, Trash2, XCircle, X, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Article } from '@/types/blog';

interface BookmarksDialogProps {
  className?: string;
}

export function BookmarksDialog({ className }: BookmarksDialogProps) {
  const { bookmarks, removeBookmark, clearBookmarks, isLoaded } = useBookmarks();
  const [open, setOpen] = useState(false);

  const handleRemoveBookmark = (event: React.MouseEvent, articleId: string) => {
    event.preventDefault();
    event.stopPropagation();
    removeBookmark(articleId);
  };

  const handleClearBookmarks = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    clearBookmarks();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)}>
          <Bookmark className="h-5 w-5" />
          {bookmarks.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {bookmarks.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Bookmarked Articles</DialogTitle>
            <DialogDescription>
              Your saved articles for reading later.
            </DialogDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        {!isLoaded ? (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading bookmarks...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="py-12 text-center">
            <XCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No bookmarks yet. Save articles to read later!</p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {bookmarks.map(article => (
                  <div 
                    key={article.id} 
                    className="flex gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors group relative"
                  >
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={article.coverImage} 
                        alt={article.title} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <Link 
                        to={`/article/${article.slug}`}
                        onClick={() => setOpen(false)}
                        className="font-medium line-clamp-2 hover:text-primary"
                      >
                        {article.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => handleRemoveBookmark(e, article.id)}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearBookmarks}
                className="text-xs"
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

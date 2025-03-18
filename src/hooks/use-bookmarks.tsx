
import { useState, useEffect, useCallback } from 'react';
import { Article } from '@/types/blog';
import { toast } from 'sonner';

const STORAGE_KEY = 'bloghub-bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const loadBookmarks = () => {
      const storedBookmarks = localStorage.getItem(STORAGE_KEY);
      if (storedBookmarks) {
        try {
          setBookmarks(JSON.parse(storedBookmarks));
        } catch (error) {
          console.error('Error parsing bookmarks:', error);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsLoaded(true);
    };

    loadBookmarks();
  }, []);

  // Save bookmarks to localStorage when they change
  useEffect(() => {
    if (!isLoaded) return;
    
    if (bookmarks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } else if (bookmarks.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [bookmarks, isLoaded]);

  const addBookmark = useCallback((article: Article) => {
    setBookmarks(prev => {
      const exists = prev.some(item => item.id === article.id);
      if (exists) return prev;
      toast.success(`"${article.title}" added to bookmarks`);
      return [...prev, article];
    });
  }, []);

  const removeBookmark = useCallback((articleId: string) => {
    setBookmarks(prev => {
      const article = prev.find(item => item.id === articleId);
      if (article) {
        toast.success(`"${article.title}" removed from bookmarks`);
      }
      return prev.filter(item => item.id !== articleId);
    });
  }, []);

  const toggleBookmark = useCallback((article: Article) => {
    const isCurrentlyBookmarked = bookmarks.some(item => item.id === article.id);
    if (isCurrentlyBookmarked) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
    }
  }, [bookmarks, addBookmark, removeBookmark]);

  const isBookmarked = useCallback((articleId: string) => {
    return bookmarks.some(item => item.id === articleId);
  }, [bookmarks]);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
    toast.success('All bookmarks cleared');
  }, []);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    clearBookmarks,
    isLoaded
  };
}

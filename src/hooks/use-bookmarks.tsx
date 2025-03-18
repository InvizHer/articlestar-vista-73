
import { useState, useEffect } from 'react';
import { Article } from '@/types/blog';
import { toast } from 'sonner';

const STORAGE_KEY = 'bloghub-bookmarks';
const MAX_BOOKMARKS = 5;

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const storedBookmarks = localStorage.getItem(STORAGE_KEY);
    if (storedBookmarks) {
      try {
        setBookmarks(JSON.parse(storedBookmarks));
      } catch (error) {
        console.error('Error parsing bookmarks:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save bookmarks to localStorage when they change
  useEffect(() => {
    if (bookmarks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } else if (bookmarks.length === 0 && localStorage.getItem(STORAGE_KEY)) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [bookmarks]);

  const addBookmark = (article: Article) => {
    setBookmarks(prev => {
      const exists = prev.some(item => item.id === article.id);
      if (exists) return prev;
      
      if (prev.length >= MAX_BOOKMARKS) {
        toast.error(`Maximum ${MAX_BOOKMARKS} bookmarks allowed. Please remove one to add more.`);
        return prev;
      }
      
      toast.success(`"${article.title}" added to bookmarks`);
      return [...prev, article];
    });
  };

  const removeBookmark = (articleId: string) => {
    setBookmarks(prev => {
      const article = prev.find(item => item.id === articleId);
      if (article) {
        toast.success(`"${article.title}" removed from bookmarks`);
      }
      return prev.filter(item => item.id !== articleId);
    });
  };

  const toggleBookmark = (article: Article) => {
    const isCurrentlyBookmarked = bookmarks.some(item => item.id === article.id);
    if (isCurrentlyBookmarked) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
    }
  };

  const isBookmarked = (articleId: string) => {
    return bookmarks.some(item => item.id === articleId);
  };

  const clearBookmarks = () => {
    setBookmarks([]);
    toast.success('All bookmarks cleared');
  };

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    clearBookmarks,
    maxBookmarksReached: bookmarks.length >= MAX_BOOKMARKS
  };
}

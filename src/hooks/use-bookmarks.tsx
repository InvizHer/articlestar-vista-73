
import { useState, useEffect } from "react";
import { Article } from "@/types/blog";
import { useDebounce } from "./use-debounce";
import { toast } from "sonner";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const loadBookmarks = () => {
      try {
        const savedBookmarks = localStorage.getItem("bookmarks");
        if (savedBookmarks) {
          setBookmarks(JSON.parse(savedBookmarks));
        }
      } catch (error) {
        console.error("Error loading bookmarks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBookmarks();
  }, []);

  // Save bookmarks to localStorage whenever they change
  const debouncedBookmarks = useDebounce(bookmarks, 500);
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      } catch (error) {
        console.error("Error saving bookmarks:", error);
      }
    }
  }, [debouncedBookmarks, isLoading]);

  // Add a bookmark
  const addBookmark = (article: Article) => {
    setBookmarks(prev => {
      // Check if article is already bookmarked
      if (prev.some(bookmark => bookmark.id === article.id)) {
        return prev;
      }
      toast.success("Article bookmarked successfully");
      return [...prev, article];
    });
    return true;
  };

  // Remove a bookmark
  const removeBookmark = (articleId: string) => {
    setBookmarks(prev => {
      const filtered = prev.filter(bookmark => bookmark.id !== articleId);
      if (filtered.length < prev.length) {
        toast.success("Article removed from bookmarks");
      }
      return filtered;
    });
    return true;
  };

  // Check if an article is bookmarked
  const isBookmarked = (articleId: string) => {
    return bookmarks.some(bookmark => bookmark.id === articleId);
  };

  // Toggle bookmark
  const toggleBookmark = (article: Article) => {
    if (isBookmarked(article.id)) {
      removeBookmark(article.id);
      return false;
    } else {
      addBookmark(article);
      return true;
    }
  };

  return {
    bookmarks,
    isLoading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark
  };
}


import React from 'react';
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { Article } from "@/types/blog";
import { 
  Bookmark, BookmarkCheck, 
  Share2, Facebook, Twitter,
  Copy, CheckCheck 
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="0"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface ArticleActionsProps {
  article: Article;
  className?: string;
  variant?: 'footer' | 'sidebar';
}

export function ArticleActions({ article, className, variant = 'footer' }: ArticleActionsProps) {
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const [copied, setCopied] = React.useState(false);
  const isBookmarkedArticle = isBookmarked(article.id);
  
  const shareUrl = window.location.href;
  const shareTitle = article.title;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };
  
  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
  };
  
  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, '_blank');
  };

  return (
    <div className={cn(
      "flex items-center gap-2",
      variant === 'sidebar' ? "flex-col" : "",
      className
    )}>
      <Button
        variant="outline"
        size={variant === 'sidebar' ? "sm" : "default"}
        className={cn(
          "gap-2 transition-colors",
          isBookmarkedArticle ? "text-primary border-primary/30 bg-primary/5 hover:bg-primary/10" : ""
        )}
        onClick={() => toggleBookmark(article)}
      >
        {isBookmarkedArticle ? (
          <>
            <BookmarkCheck className="h-4 w-4" />
            <span>Saved</span>
          </>
        ) : (
          <>
            <Bookmark className="h-4 w-4" />
            <span>Save</span>
          </>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={variant === 'sidebar' ? "sm" : "default"}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={shareToFacebook}>
            <Facebook className="h-4 w-4" />
            <span>Facebook</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={shareToTwitter}>
            <Twitter className="h-4 w-4" />
            <span>Twitter</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={shareToWhatsApp}>
            <WhatsAppIcon />
            <span>WhatsApp</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={copyToClipboard}>
            {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "Copied" : "Copy Link"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}


import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MessageSquare } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface AuthorCardProps {
  author: {
    name: string;
    avatar: string;
    role?: string;
  };
  date: string;
  readTime: string;
  commentsCount?: number;
  category?: string;
  className?: string;
  variant?: 'compact' | 'full';
}

export function AuthorCard({
  author,
  date,
  readTime,
  commentsCount,
  category,
  className,
  variant = 'full'
}: AuthorCardProps) {
  return (
    <div className={cn(
      "flex items-center gap-4 text-sm",
      variant === 'compact' ? "flex-wrap justify-start" : "",
      className
    )}>
      <div className="flex items-center gap-2">
        <Avatar className="h-10 w-10 border-2 border-primary/10">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-0.5">
          <div className="font-medium">{author.name}</div>
          {author.role && <div className="text-xs text-muted-foreground">{author.role}</div>}
        </div>
      </div>

      <div className={cn(
        "flex flex-wrap gap-3 text-muted-foreground",
        variant === 'compact' ? "mt-0" : "ml-auto"
      )}>
        {category && (
          <Badge variant="outline" className="bg-primary/5">
            {category}
          </Badge>
        )}
        
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>{date}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{readTime}</span>
        </div>
        
        {commentsCount !== undefined && (
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{commentsCount} comments</span>
          </div>
        )}
      </div>
    </div>
  );
}

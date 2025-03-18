
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Author {
  name: string;
  avatar: string;
  bio: string;
  role?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

interface ProfileCardProps {
  author: Author;
  className?: string;
}

export function ProfileCard({ author, className }: ProfileCardProps) {
  return (
    <Card className={cn("overflow-hidden border-purple-100/50 dark:border-purple-900/20", className)}>
      <div className="h-12 bg-gradient-to-r from-primary/20 to-purple-500/20" />
      <CardContent className="pt-0 relative">
        <div className="flex flex-col items-center -mt-8 mb-4">
          <Avatar className="h-16 w-16 border-4 border-background">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className="text-lg">{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-medium mt-2">{author.name}</h3>
          {author.role && (
            <p className="text-sm text-muted-foreground">{author.role}</p>
          )}
        </div>

        <p className="text-sm text-center mb-4">
          {author.bio}
        </p>

        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" className="rounded-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact
          </Button>
          {author.social?.twitter && (
            <a href={author.social.twitter} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="rounded-full">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

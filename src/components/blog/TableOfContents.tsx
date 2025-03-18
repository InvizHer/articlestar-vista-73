
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { List, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLElement>;
  className?: string;
}

export function TableOfContents({ contentRef, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!contentRef.current) return;
    
    const element = contentRef.current;
    const headingElements = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const extractedHeadings: Heading[] = Array.from(headingElements)
      .filter(heading => heading.id)
      .map(heading => ({
        id: heading.id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.substring(1)),
      }));
      
    setHeadings(extractedHeadings);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0px 0px -80% 0px',
        threshold: 0.1,
      }
    );
    
    headingElements.forEach(heading => {
      if (heading.id) {
        observer.observe(heading);
      }
    });
    
    return () => {
      headingElements.forEach(heading => {
        if (heading.id) {
          observer.unobserve(heading);
        }
      });
    };
  }, [contentRef.current]);
  
  if (headings.length === 0) return null;
  
  return (
    <div className={cn("rounded-lg border bg-card shadow-sm sticky top-4", className)}>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <button className={cn(
            buttonVariants({ variant: "ghost" }),
            "flex w-full items-center justify-between p-3"
          )}>
            <div className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="font-medium">Table of Contents</span>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <ul className="space-y-1">
              {headings.map((heading) => (
                <li key={heading.id} className="text-sm">
                  <a
                    href={`#${heading.id}`}
                    className={cn(
                      "block py-1 hover:text-primary transition-colors",
                      activeId === heading.id ? "text-primary font-medium" : "text-muted-foreground",
                      heading.level === 2 && "pl-0",
                      heading.level === 3 && "pl-4",
                      heading.level === 4 && "pl-8",
                      heading.level >= 5 && "pl-12"
                    )}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

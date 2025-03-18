
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CategoryBadgeProps {
  category: string;
  count?: number;
  link?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category, 
  count, 
  link,
  variant = "default",
  size = "default" 
}) => {
  const classes = cn(
    "transition-all duration-300",
    size === "sm" ? "px-2 py-0.5 text-xs" : 
    size === "lg" ? "px-4 py-1.5 text-base" : 
    "px-3 py-1 text-sm",
    variant === "outline" ? "hover:bg-primary/10" : "hover:bg-primary hover:text-primary-foreground"
  );
  
  const content = (
    <>
      {category}
      {count !== undefined && (
        <span className={cn(
          "ml-1.5 px-1.5 py-0.5 text-xs rounded-full inline-flex items-center justify-center",
          variant === "outline" ? "bg-muted text-muted-foreground" : "bg-primary-foreground/20"
        )}>
          {count}
        </span>
      )}
    </>
  );
  
  if (link) {
    return (
      <Link to={link}>
        <Badge variant={variant} className={classes}>
          {content}
        </Badge>
      </Link>
    );
  }
  
  return (
    <Badge variant={variant} className={classes}>
      {content}
    </Badge>
  );
};

export default CategoryBadge;

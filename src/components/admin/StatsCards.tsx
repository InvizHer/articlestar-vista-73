
import React from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, CircleCheck, CircleOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  activeTab: "all" | "published" | "draft";
  handleTabChange: (value: "all" | "published" | "draft") => void;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalArticles,
  publishedArticles,
  draftArticles,
  activeTab,
  handleTabChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card 
        className={cn(
          "border shadow-sm hover:shadow-md transition-shadow cursor-pointer",
          activeTab === "all" ? "ring-2 ring-primary/20" : ""
        )}
        onClick={() => handleTabChange("all")}
      >
        <div className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">All Articles</p>
            <h3 className="text-2xl font-bold">{totalArticles}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>
      </Card>
      
      <Card 
        className={cn(
          "border shadow-sm hover:shadow-md transition-shadow cursor-pointer",
          activeTab === "published" ? "ring-2 ring-primary/20" : ""
        )}
        onClick={() => handleTabChange("published")}
      >
        <div className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Published</p>
            <h3 className="text-2xl font-bold">{publishedArticles}</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full">
            <CircleCheck className="h-5 w-5" />
          </div>
        </div>
      </Card>
      
      <Card 
        className={cn(
          "border shadow-sm hover:shadow-md transition-shadow cursor-pointer",
          activeTab === "draft" ? "ring-2 ring-primary/20" : ""
        )}
        onClick={() => handleTabChange("draft")}
      >
        <div className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Drafts</p>
            <h3 className="text-2xl font-bold">{draftArticles}</h3>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">
            <CircleOff className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsCards;

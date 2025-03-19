
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ListFilter, ArrowDown, ArrowUp, ArrowDownUp, Eye } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ArticleFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  activeTab: "all" | "published" | "draft";
  setActiveTab: (value: "all" | "published" | "draft") => void;
  sortBy: "newest" | "oldest" | "views" | "title";
  setSortBy: (value: "newest" | "oldest" | "views" | "title") => void;
}

const ArticleFilters: React.FC<ArticleFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  sortBy,
  setSortBy
}) => {
  const getSortIcon = () => {
    switch (sortBy) {
      case "newest":
      case "views":
        return <ArrowDown className="h-3.5 w-3.5" />;
      case "oldest":
        return <ArrowUp className="h-3.5 w-3.5" />;
      case "title":
        return <ArrowDownUp className="h-3.5 w-3.5" />;
      default:
        return <ArrowDownUp className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <ListFilter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
              <Badge className="ml-1" variant="secondary">
                {activeTab === "all" ? "All" : activeTab === "published" ? "Published" : "Drafts"}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
              <DropdownMenuRadioItem value="all">All Articles</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="published">Published</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="draft">Drafts</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {getSortIcon()}
              <span className="hidden sm:inline">Sort</span>
              <Badge className="ml-1" variant="secondary">
                {sortBy === "newest" ? "Newest" : 
                 sortBy === "oldest" ? "Oldest" : 
                 sortBy === "views" ? "Views" : "Title"}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <DropdownMenuRadioItem value="newest">
                <ArrowDown className="mr-2 h-3.5 w-3.5" />
                Newest First
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="oldest">
                <ArrowUp className="mr-2 h-3.5 w-3.5" />
                Oldest First
              </DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="views">
                <Eye className="mr-2 h-3.5 w-3.5" />
                Most Views
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="title">
                <ArrowDownUp className="mr-2 h-3.5 w-3.5" />
                Title (A-Z)
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ArticleFilters;

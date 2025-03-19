
import React from "react";
import { Article } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2, FilePlus } from "lucide-react";
import ArticleListItem from "./ArticleListItem";

interface ArticlesListProps {
  loading: boolean;
  filteredArticles: Article[];
  activeTab: string;
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  searchTerm: string;
  onDeleteArticle: (article: Article) => void;
}

const ArticlesList: React.FC<ArticlesListProps> = ({
  loading,
  filteredArticles,
  activeTab,
  totalArticles,
  publishedArticles,
  draftArticles,
  searchTerm,
  onDeleteArticle
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (filteredArticles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? `No articles found matching "${searchTerm}"`
              : activeTab !== "all" 
                ? `No ${activeTab} articles found` 
                : "No articles found"}
          </p>
          {searchTerm ? (
            <Button variant="outline" onClick={() => {}} className="mr-2">
              Clear Search
            </Button>
          ) : (
            <Button asChild>
              <Link to="/admin/article/new">Create Your First Article</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {filteredArticles.map((article) => (
          <ArticleListItem 
            key={article.id}
            article={article} 
            onDelete={() => onDeleteArticle(article)} 
          />
        ))}
      </div>
      
      <div className="py-4 mt-6 border-t flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {filteredArticles.length} of {
            activeTab === "all" 
              ? totalArticles 
              : activeTab === "published" 
                ? publishedArticles 
                : draftArticles
          } articles
        </p>
        
        <Button asChild>
          <Link to="/admin/article/new" className="flex items-center gap-2">
            <FilePlus className="h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>
    </>
  );
};

export default ArticlesList;

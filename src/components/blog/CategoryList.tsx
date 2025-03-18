
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  name: string;
  count: number;
}

interface CategoryListProps {
  categories: Category[];
  initialDisplayCount?: number;
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  categories,
  initialDisplayCount = 6
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const displayedCategories = expanded 
    ? categories 
    : categories.slice(0, initialDisplayCount);
  
  const hasMoreCategories = categories.length > initialDisplayCount;
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-4">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
      >
        {displayedCategories.map((category, index) => (
          <motion.div 
            key={category.name} 
            variants={item}
            whileHover={{ scale: 1.02 }}
            className="transition-all duration-300"
          >
            <Link
              to={`/articles?category=${category.name}`}
              className="group flex items-center justify-between p-4 bg-card hover:bg-primary/5 border hover:border-primary/20 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-1 bg-primary rounded-full group-hover:h-10 transition-all"></div>
                <div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.count} article{category.count !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
      
      {hasMoreCategories && (
        <div className="flex justify-center mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={expanded ? 'less' : 'more'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                onClick={toggleExpanded} 
                variant="outline" 
                className="rounded-full gap-2"
              >
                {expanded ? (
                  <>
                    <Minus className="h-4 w-4" />
                    Show Less Categories
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Show More Categories
                  </>
                )}
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CategoryList;


import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  center?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  center = false,
}) => {
  return (
    <div className={`mb-12 ${center ? "text-center" : ""}`}>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
        {title}
      </h1>
      {description && (
        <p className="text-lg text-muted-foreground max-w-3xl">
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;


import { Article } from "@/types/blog";

export const articles: Article[] = [
  {
    id: "1",
    title: "Getting Started with React and TypeScript",
    slug: "getting-started-with-react-typescript",
    excerpt: "Learn how to set up a new project with React and TypeScript from scratch.",
    content: `
# Getting Started with React and TypeScript

React and TypeScript are a powerful combination for building robust web applications. TypeScript adds static typing to JavaScript, which helps catch errors during development and provides better tooling support.

## Why TypeScript with React?

- **Type Safety**: Catch errors before runtime
- **Better IDE Support**: Improved autocomplete and documentation
- **Enhanced Component Props**: Clear interface for component communication
- **Easier Refactoring**: Change code with confidence

## Setting Up Your Project

To create a new React project with TypeScript support, you can use Create React App with the TypeScript template:

\`\`\`bash
npx create-react-app my-app --template typescript
\`\`\`

Or if you prefer Vite:

\`\`\`bash
npm create vite@latest my-app -- --template react-ts
\`\`\`

## Your First Component

Here's a simple React component with TypeScript:

\`\`\`tsx
interface ButtonProps {
  text: string;
  onClick: () => void;
  color?: 'primary' | 'secondary';
}

const Button = ({ text, onClick, color = 'primary' }: ButtonProps) => {
  return (
    <button 
      onClick={onClick}
      className={\`btn btn-\${color}\`}
    >
      {text}
    </button>
  );
};
\`\`\`

## Conclusion

TypeScript makes React development more predictable and maintainable, especially for larger projects. While there is a small learning curve, the benefits quickly outweigh the costs as your project grows.
    `,
    author: {
      name: "Jane Smith",
      avatar: "/placeholder.svg"
    },
    date: "2023-10-15",
    readTime: "5 min read",
    category: "Development",
    tags: ["React", "TypeScript", "Web Development"],
    coverImage: "/placeholder.svg",
    featured: true,
    viewCount: 1250
  },
  {
    id: "2",
    title: "Mastering CSS Grid Layout",
    slug: "mastering-css-grid-layout",
    excerpt: "Everything you need to know about CSS Grid Layout to create powerful web layouts.",
    content: `
# Mastering CSS Grid Layout

CSS Grid Layout is a two-dimensional layout system that revolutionizes how we design web layouts. It provides precise control over both rows and columns, making complex layouts easier than ever.

## Basic Grid Concepts

To create a grid container, you simply need to set the display property:

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
}
\`\`\`

This creates a three-column grid with equal width columns and 20px gaps.

## Grid Areas

One of the most powerful features of CSS Grid is named grid areas:

\`\`\`css
.container {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar content content"
    "footer footer footer";
  grid-template-columns: 1fr 3fr 1fr;
  grid-gap: 10px;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.footer { grid-area: footer; }
\`\`\`

## Responsive Grids

CSS Grid works beautifully with media queries for responsive designs:

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-gap: 20px;
}
\`\`\`

This creates a responsive grid where columns automatically adjust based on the available space.

## Conclusion

CSS Grid Layout has transformed web layout design. With broad browser support and powerful features, it's become an essential tool for modern web developers.
    `,
    author: {
      name: "Mark Johnson",
      avatar: "/placeholder.svg"
    },
    date: "2023-09-28",
    readTime: "7 min read",
    category: "CSS",
    tags: ["CSS", "Web Design", "Layout"],
    coverImage: "/placeholder.svg",
    editorPick: true,
    viewCount: 980
  },
  {
    id: "3",
    title: "Introduction to Tailwind CSS",
    slug: "introduction-to-tailwind-css",
    excerpt: "Discover how Tailwind CSS can revolutionize your frontend development workflow.",
    content: `
# Introduction to Tailwind CSS

Tailwind CSS is a utility-first CSS framework that allows you to build custom designs without leaving your HTML. Instead of pre-designed components, Tailwind provides low-level utility classes that let you build completely custom designs.

## Why Tailwind?

- **No more naming things**: Say goodbye to BEM or other naming conventions
- **Consistent design decisions**: Work within your design system constraints
- **Responsive out of the box**: Built-in responsive modifiers
- **Dark mode included**: Easy dark mode implementation
- **Highly customizable**: Tailor Tailwind to your project's needs

## Getting Started

The easiest way to add Tailwind to your project is through npm:

\`\`\`bash
npm install -D tailwindcss
npx tailwindcss init
\`\`\`

Then configure your template paths in \`tailwind.config.js\`:

\`\`\`js
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
\`\`\`

## Using Utility Classes

Here's an example of a card component built with Tailwind:

\`\`\`html
<div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
  <div class="md:flex">
    <div class="md:shrink-0">
      <img class="h-48 w-full object-cover md:h-full md:w-48" src="/img/card-image.jpg" alt="Modern building">
    </div>
    <div class="p-8">
      <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Company Name</div>
      <a href="#" class="block mt-1 text-lg leading-tight font-medium text-black hover:underline">Product Title</a>
      <p class="mt-2 text-slate-500">This is a brief description of the product or service being offered.</p>
    </div>
  </div>
</div>
\`\`\`

## Conclusion

While Tailwind's utility-first approach might seem verbose at first, the productivity gains are substantial. The framework encourages consistency, makes responsive design easier, and eliminates the need for maintaining separate CSS files.
    `,
    author: {
      name: "Sarah Lee",
      avatar: "/placeholder.svg"
    },
    date: "2023-11-02",
    readTime: "6 min read",
    category: "CSS",
    tags: ["Tailwind", "CSS", "Frontend"],
    coverImage: "/placeholder.svg",
    editorPick: true,
    viewCount: 875
  }
];

export const getArticleBySlug = (slug: string): Article | undefined => {
  return articles.find(article => article.slug === slug);
};

export const getRecentArticles = (count: number = 3): Article[] => {
  return [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, count);
};

export const getRelatedArticles = (currentSlug: string, count: number = 2): Article[] => {
  const currentArticle = getArticleBySlug(currentSlug);
  if (!currentArticle) return [];
  
  return articles
    .filter(article => article.slug !== currentSlug)
    .filter(article => 
      article.category === currentArticle.category || 
      article.tags.some(tag => currentArticle.tags.includes(tag))
    )
    .slice(0, count);
};

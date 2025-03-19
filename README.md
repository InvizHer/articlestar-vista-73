
# ArticleStar Vista - Modern Blog Platform

A full-featured blog platform built with React, TypeScript, Tailwind CSS, and Supabase.

## Project Overview

ArticleStar Vista is a modern blog platform featuring:

- Responsive design for all devices
- Public article viewing with commenting system
- Admin dashboard for content management
- Article editor with rich text formatting
- Analytics for tracking performance
- User-friendly commenting system
- Dark/light mode and theme customization

## Tech Stack

This project is built with:

- **Frontend**: React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Management**: TanStack React Query
- **Backend**: Supabase
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Charts**: Recharts
- **Build Tool**: Vite

## Setting Up Your Own Instance (Important)

### 1. Supabase Configuration

To set up your own instance of this blog platform, you need to configure Supabase first:

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Once your project is created, go to the project settings
3. Copy your project's URL and anon/public key from the API settings page
4. Open `src/integrations/supabase/client.ts` in your forked repository
5. Replace the values for `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` with your own credentials:

```typescript
// Replace these with your own Supabase credentials
const SUPABASE_URL = "your-supabase-project-url";
const SUPABASE_PUBLISHABLE_KEY = "your-supabase-anon-key";
```

Don't worry about setting up tables and functions manually. The application is designed to automatically create all required database structures when it first runs.

### 2. Deploy Your Project

Deploy your project using one of the methods below. When the application starts for the first time, it will automatically:

- Create all necessary tables in your Supabase project
- Set up required database functions
- Initialize default settings

This auto-setup feature means you don't need to manually configure your database.

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher)

### Local Development

```sh
# Clone the repository
git clone <your-repo-url>

# Navigate to the project directory
cd articlestar-vista

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:8080

### Building for Production

```sh
# Create an optimized production build
npm run build

# Preview the production build locally
npm run preview
```

## Deployment Options

### 1. Netlify Deployment

#### Option A: Deploy via Netlify UI

1. Create a Netlify account at [netlify.com](https://www.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider (GitHub, GitLab, etc.)
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

#### Option B: Deploy via Netlify CLI

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Build your project: `npm run build`
3. Login to Netlify: `netlify login`
4. Initialize a new Netlify site: `netlify init`
5. Follow the prompts to deploy your site

### 2. Vercel Deployment

#### Option A: Deploy via Vercel UI

1. Create a Vercel account at [vercel.com](https://vercel.com/)
2. Click "Add New" → "Project"
3. Import your repository
4. Configure project settings:
   - Framework Preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
5. Click "Deploy"

#### Option B: Deploy via Vercel CLI

1. Install Vercel CLI: `npm install -g vercel`
2. Login to Vercel: `vercel login`
3. Deploy your project: `vercel`
4. Follow the prompts to deploy your site

### 3. Render Deployment

1. Create a Render account at [render.com](https://render.com/)
2. Click "New" → "Static Site"
3. Connect to your repository
4. Configure build settings:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
5. Click "Create Static Site"

### 4. GitHub Pages Deployment

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add these scripts to your package.json:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. Add a "homepage" field to package.json:
   ```json
   "homepage": "https://yourusername.github.io/your-repo-name"
   ```
4. Deploy to GitHub Pages: `npm run deploy`

### 5. Docker Deployment

Create a `Dockerfile` in your project root:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run the Docker container:

```sh
# Build the Docker image
docker build -t articlestar-vista .

# Run the container
docker run -p 8080:80 articlestar-vista
```

## Environment Configuration

For each deployment, ensure you have updated the Supabase credentials in `src/integrations/supabase/client.ts` before building the project.

## Custom Domain Setup

Once deployed, you can configure a custom domain:

1. Purchase a domain from a domain registrar (Namecheap, GoDaddy, etc.)
2. In your deployment platform (Netlify, Vercel, etc.), go to the site settings
3. Look for "Custom domains" or "Domain management"
4. Add your custom domain and follow the DNS configuration instructions

## Troubleshooting Deployment Issues

### Common Issues:

1. **Database Setup Errors**: If you see errors about database setup in the console, check your Supabase credentials to ensure they're correct.
   
   Solution: Verify your Supabase URL and key in `src/integrations/supabase/client.ts`.

2. **API Connection Issues**: Check if environment variables are correctly set.
   
   Solution: Make sure your Supabase credentials are updated before deployment.

3. **Routing Problems**: Single-page apps need proper redirect rules.
   
   Solution: For Netlify, a `_redirects` file is already included in the `public` folder.

## Maintenance and Updates

After deployment, regularly update dependencies to ensure security and performance:

```sh
# Check for outdated packages
npm outdated

# Update packages
npm update
```

## Questions and Support

For questions or support, please open an issue in the GitHub repository or contact the development team.


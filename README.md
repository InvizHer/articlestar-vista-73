
# Blog Platform

A full-featured blog platform built with React, TypeScript, and Supabase.

## Features

- 📝 Create, edit, and publish articles with a rich text editor
- 💬 Comment system for reader engagement
- 📊 Analytics to track article performance
- 🎨 Customizable themes and colors
- 👤 Admin panel for content management

## Deployment Setup

This project is designed to be easy to fork and deploy with your own Supabase backend. Follow these steps to get started:

### 1. Fork this Repository

Click the "Fork" button in the upper right of the GitHub repository.

### 2. Create a Supabase Project

1. Sign up for a free Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Make note of your project URL and anon/public key

### 3. Update Supabase Credentials

Update the Supabase credentials in `src/integrations/supabase/client.ts`:

```typescript
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "your-anon-key";
```

Replace `your-project-id` and `your-anon-key` with your actual Supabase project details.

### 4. Deploy Your Project

Deploy your project to your preferred hosting platform (Vercel, Netlify, etc).

### 5. First Run

When your application runs for the first time:
- It will automatically set up all required database tables and functions
- A default admin user will be created with:
  - Username: `admin`
  - Password: `admin123`
- Default theme settings and a sample article will be created

### 6. Important Security Notes

- **Change the default admin password** immediately after first login
- If you plan to use this in production, you should implement proper authentication and security measures

## Local Development

1. Clone your forked repository
2. Install dependencies: `npm install`
3. Update Supabase credentials as described above
4. Start the development server: `npm run dev`

## License

This project is available under the MIT License.

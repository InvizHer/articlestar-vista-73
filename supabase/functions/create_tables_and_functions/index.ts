
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Execute SQL to create all tables and functions
    const sql = `
    -- Create articles table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.articles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_avatar TEXT,
      date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      read_time TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT[] NOT NULL,
      cover_image TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      published BOOLEAN NOT NULL DEFAULT false,
      view_count INTEGER NOT NULL DEFAULT 0,
      comments_enabled BOOLEAN NOT NULL DEFAULT true
    );

    -- Create admins table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.admins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );

    -- Create unified_comments table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.unified_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
      parent_id UUID REFERENCES public.unified_comments(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT,
      content TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT false,
      admin_username TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );

    -- Create likes table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.likes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );

    -- Create site_settings table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.site_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      default_theme TEXT NOT NULL DEFAULT 'system',
      default_theme_color TEXT NOT NULL DEFAULT 'purple',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );

    -- Create increment_view_count function if it doesn't exist
    CREATE OR REPLACE FUNCTION public.increment_view_count(article_id UUID)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      UPDATE public.articles
      SET view_count = view_count + 1
      WHERE id = article_id;
    END;
    $$;

    -- Create toggle_like function if it doesn't exist
    CREATE OR REPLACE FUNCTION public.toggle_like(p_article_id UUID)
    RETURNS integer
    LANGUAGE plpgsql
    AS $$
    DECLARE
      new_count INTEGER;
    BEGIN
      -- Insert a new like
      INSERT INTO public.likes (article_id)
      VALUES (p_article_id);
      
      -- Get the updated count
      SELECT COUNT(*) FROM public.likes 
      WHERE article_id = p_article_id INTO new_count;
      
      RETURN new_count;
    END;
    $$;

    -- Create get_like_count function if it doesn't exist
    CREATE OR REPLACE FUNCTION public.get_like_count(p_article_id UUID)
    RETURNS integer
    LANGUAGE plpgsql
    AS $$
    DECLARE
      like_count INTEGER;
    BEGIN
      SELECT COUNT(*) FROM public.likes 
      WHERE article_id = p_article_id INTO like_count;
      
      RETURN like_count;
    END;
    $$;

    -- Create remove_like function if it doesn't exist
    CREATE OR REPLACE FUNCTION public.remove_like(p_article_id UUID)
    RETURNS integer
    LANGUAGE plpgsql
    AS $$
    DECLARE
      new_count INTEGER;
    BEGIN
      -- Delete a like (the oldest one for simplicity)
      DELETE FROM public.likes 
      WHERE id = (
        SELECT id FROM public.likes 
        WHERE article_id = p_article_id 
        ORDER BY created_at ASC 
        LIMIT 1
      );
      
      -- Get the updated count
      SELECT COUNT(*) FROM public.likes 
      WHERE article_id = p_article_id INTO new_count;
      
      RETURN new_count;
    END;
    $$;

    -- Create create_settings_table function if it doesn't exist
    CREATE OR REPLACE FUNCTION public.create_settings_table()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      -- This function exists just to ensure the table is created
      -- The actual table creation happens in the migration
      NULL;
    END;
    $$;

    -- Add default admin user if not exists
    INSERT INTO public.admins (username, password)
    SELECT 'admin', 'admin123'
    WHERE NOT EXISTS (SELECT 1 FROM public.admins WHERE username = 'admin');

    -- Create initial settings if they don't exist
    INSERT INTO public.site_settings (default_theme, default_theme_color)
    SELECT 'system', 'purple'
    WHERE NOT EXISTS (SELECT 1 FROM public.site_settings LIMIT 1);

    -- Add sample article if no articles exist
    INSERT INTO public.articles (
      title, 
      slug, 
      excerpt, 
      content, 
      author_name, 
      read_time, 
      category, 
      tags, 
      published
    )
    SELECT 
      'Welcome to Your Blog', 
      'welcome-to-your-blog', 
      'Get started with your new blog platform. This is a sample article to help you get started.', 
      '# Welcome to Your Blog\n\nThis is a sample article created automatically when you set up your blog. You can edit or delete it from the admin panel.\n\n## Getting Started\n\n1. Log in to the admin panel with username: admin and password: admin123\n2. Navigate to Articles to manage your content\n3. Customize the site settings\n\n## Features\n\nYour blog comes with many features:\n\n- Markdown support for writing articles\n- Comment system for reader engagement\n- Analytics to track performance\n- Theme customization\n\nEnjoy your new blog!',
      'System', 
      '3 min read', 
      'Getting Started', 
      ARRAY['welcome', 'guide'], 
      TRUE
    WHERE NOT EXISTS (SELECT 1 FROM public.articles LIMIT 1);
    `;

    const { error: execError } = await supabaseAdmin.rpc('exec_sql', { sql });
    
    if (execError) {
      throw new Error(`Failed to initialize database: ${execError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Database setup completed successfully" 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 500 
      }
    );
  }
});


import { supabase } from './client';

/**
 * Database setup function that automatically creates all required tables,
 * functions, and initial data in a Supabase project.
 */
export const setupDatabase = async () => {
  try {
    console.log('Starting database setup...');
    
    // Step 1: Create the necessary tables if they don't exist
    await createTables();
    
    // Step 2: Create database functions if they don't exist
    await createFunctions();
    
    // Step 3: Create initial settings if they don't exist
    await createInitialSettings();
    
    console.log('Database setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
};

const createTables = async () => {
  // Check if articles table exists
  const { error: articlesCheckError } = await supabase
    .from('articles')
    .select('id')
    .limit(1);
    
  if (articlesCheckError && articlesCheckError.code === '42P01') {
    // Table doesn't exist, create it
    const { error: createArticlesError } = await supabase.rpc('create_articles_table');
    if (createArticlesError) {
      console.error('Error creating articles table:', createArticlesError);
    } else {
      console.log('Created articles table');
    }
  }
  
  // Check if admins table exists
  const { error: adminsCheckError } = await supabase
    .from('admins')
    .select('id')
    .limit(1);
    
  if (adminsCheckError && adminsCheckError.code === '42P01') {
    // Table doesn't exist, create it
    const { error: createAdminsError } = await supabase.rpc('create_admins_table');
    if (createAdminsError) {
      console.error('Error creating admins table:', createAdminsError);
    } else {
      console.log('Created admins table');
    }
  }
  
  // Check if unified_comments table exists
  const { error: commentsCheckError } = await supabase
    .from('unified_comments')
    .select('id')
    .limit(1);
    
  if (commentsCheckError && commentsCheckError.code === '42P01') {
    // Table doesn't exist, create it
    const { error: createCommentsError } = await supabase.rpc('create_comments_table');
    if (createCommentsError) {
      console.error('Error creating comments table:', createCommentsError);
    } else {
      console.log('Created comments table');
    }
  }
  
  // Check if likes table exists
  const { error: likesCheckError } = await supabase
    .from('likes')
    .select('id')
    .limit(1);
    
  if (likesCheckError && likesCheckError.code === '42P01') {
    // Table doesn't exist, create it
    const { error: createLikesError } = await supabase.rpc('create_likes_table');
    if (createLikesError) {
      console.error('Error creating likes table:', createLikesError);
    } else {
      console.log('Created likes table');
    }
  }
};

const createFunctions = async () => {
  try {
    // Create all necessary database functions
    await supabase.rpc('create_db_functions');
    console.log('Database functions created successfully');
  } catch (error) {
    console.error('Error creating database functions:', error);
  }
};

const createInitialSettings = async () => {
  // Check if site_settings table exists
  const { error: settingsCheckError } = await supabase
    .from('site_settings')
    .select('id')
    .limit(1);
    
  if (settingsCheckError && settingsCheckError.code === '42P01') {
    // Table doesn't exist, create it
    const { error: createSettingsError } = await supabase.rpc('create_settings_table');
    if (createSettingsError) {
      console.error('Error creating settings table:', createSettingsError);
    } else {
      console.log('Created settings table');
      
      // Insert initial settings
      const { error: insertError } = await supabase
        .from('site_settings')
        .insert([
          { 
            default_theme: 'system',
            default_theme_color: 'purple'
          }
        ]);
        
      if (insertError) {
        console.error('Error inserting initial settings:', insertError);
      } else {
        console.log('Inserted initial settings');
      }
    }
  }
};

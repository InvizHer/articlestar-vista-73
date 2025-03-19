
import { supabase } from './client';

/**
 * Database setup function that automatically creates all required tables,
 * functions, and initial data in a Supabase project.
 */
export const setupDatabase = async () => {
  try {
    console.log('Starting database setup...');
    
    // First, check if any articles table already exists
    // If it does, we can assume the database is already set up
    const { data: articleData, error: articleError } = await supabase
      .from('articles')
      .select('id')
      .limit(1);
    
    if (!articleError && articleData) {
      console.log('Database appears to be already set up, skipping initialization');
      return true;
    }
    
    // Call the Edge Function to create tables and functions
    const { data, error } = await supabase.functions.invoke('create_tables_and_functions');
    
    if (error) {
      console.error('Error setting up database:', error);
      return false;
    }
    
    console.log('Database setup response:', data);
    console.log('Database setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
};

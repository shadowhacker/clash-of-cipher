import { supabase } from '@/integrations/supabase/client';

// In Vite, use only import.meta.env, not process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase credentials are available
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;


export async function fetchGameConfig() {
  if (!supabase) {
    console.warn('Supabase client not configured. Using default game config.');
    // Return default config from local JSON
    return (await import('../config/gameConfig.json')).default;
  }

  try {
    // Using a type assertion to bypass the TypeScript error
    // This assumes you have a game_config table in your actual database
    // but it's not reflected in your TypeScript types yet
    const { data, error } = await (supabase
      .from('game_config' as any)
      .select('*')
      .single());

    if (error) throw error;

    // Check if data exists and has config_json property
    if (data && 'config_json' in data) {
      return data.config_json;
    } else {
      console.error('No config data found or invalid format');
      return null;
    }
  } catch (error) {
    console.error('Error fetching game config:', error);
    // Fallback to local config
    return (await import('../config/gameConfig.json')).default;
  }
}
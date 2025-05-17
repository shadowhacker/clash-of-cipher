import { createClient } from '@supabase/supabase-js';

// In Vite, use only import.meta.env, not process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase credentials are available
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// Create the Supabase client only if credentials are available
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function fetchGameConfig() {
  if (!supabase) {
    console.warn('Supabase client not configured. Using default game config.');
    // Return default config from local JSON
    return (await import('../config/gameConfig.json')).default;
  }

  try {
    const { data, error } = await supabase
      .from('game_config')
      .select('config_name, config_json')
      .eq('config_name', 'default')
      .single();
      
    if (error) throw error;
    return data.config_json;
  } catch (error) {
    console.error('Error fetching game config:', error);
    // Fallback to local config
    return (await import('../config/gameConfig.json')).default;
  }
}

export async function updateGameConfig(configName = 'default', configJson) {
  if (!supabase) {
    console.warn('Supabase client not configured. Cannot update game config.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('game_config')
      .update({ config_json: configJson, updated_at: new Date() })
      .eq('config_name', configName)
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating game config:', error);
    return null;
  }
} 
import { supabase } from "@/integrations/supabase/client";

// In-memory cache for config
let cachedConfig: any = null;
let configPromise: Promise<any> | null = null;

export async function fetchGameConfig() {
  if (cachedConfig) return cachedConfig;
  if (configPromise) return configPromise;

  configPromise = (async () => {
    if (!supabase) {
      console.warn(
        "Supabase client not configured. Using default game config."
      );
      // Return default config from local JSON
      const localConfig = (await import("../config/gameConfig.json")).default;
      cachedConfig = localConfig;
      return localConfig;
    }

    try {
      // Using a type assertion to bypass the TypeScript error
      // This assumes you have a game_config table in your actual database
      // but it's not reflected in your TypeScript types yet
      const { data, error } = await supabase
        .from("game_config" as any)
        .select("config_json")
        .single();

      if (error) {
        console.warn("Error fetching game config:", error);
        // Fallback to local config
        const localConfig = (await import("../config/gameConfig.json")).default;
        cachedConfig = localConfig;
        return localConfig;
      }

      // If no rows, fallback
      if (!data || !("config_json" in data)) {
        console.warn("No config found in Supabase, using local config.");
        const localConfig = (await import("../config/gameConfig.json")).default;
        cachedConfig = localConfig;
        return localConfig;
      }

      cachedConfig = data.config_json;
      return data.config_json;
    } catch (err) {
      console.warn("Error fetching game config:", err);
      // Fallback to local config
      const localConfig = (await import("../config/gameConfig.json")).default;
      cachedConfig = localConfig;
      return localConfig;
    }
  })();

  return configPromise;
}

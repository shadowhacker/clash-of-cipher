import { supabase } from '@/integrations/supabase/client';
import logger from './logger';

// Default sound paths (fallback if Supabase fails)
const DEFAULT_SOUNDS = {
  success: '/snd/success.mp3',
  fail: '/snd/fail.mp3',
  victory: '/snd/victory.mp3',
  intro: 'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/sounds/intro_sound.mp3'
};

// Cache for sound URLs
let cachedSounds: Record<string, string> | null = null;
let soundsPromise: Promise<Record<string, string>> | null = null;
const subscribers: ((sounds: Record<string, string>) => void)[] = [];

// Background music instance
let backgroundMusic: HTMLAudioElement | null = null;
let isMusicMuted = false;

// Volume settings (0-1)
let musicVolume = 0.5;
let effectsVolume = 0.7;

// Preloaded audio elements
const preloadedSounds: Record<string, HTMLAudioElement> = {};

// Audio context for better control
let audioContext: AudioContext | null = null;
let audioContextInitialized = false;

/**
 * Initialize the audio context to help with autoplay restrictions
 * @returns Promise that resolves when the audio context is initialized
 */
export async function initializeAudioContext(): Promise<boolean> {
  if (audioContextInitialized) return true;
  
  try {
    // Create audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      logger.warn('[AUDIO] AudioContext not supported in this browser');
      return false;
    }
    
    audioContext = new AudioContextClass();
    
    // Create and play a silent buffer to unlock the audio context
    const silentBuffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = silentBuffer;
    source.connect(audioContext.destination);
    source.start(0);
    
    // Resume the audio context (needed for some browsers)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    audioContextInitialized = true;
    logger.info('[AUDIO] Audio context initialized successfully');
    return true;
  } catch (err) {
    logger.error('[AUDIO] Failed to initialize audio context:', err);
    return false;
  }
}

/**
 * Set up user interaction listeners to initialize audio
 */
export function setupAudioUnlockListeners(): void {
  if (audioContextInitialized) return;
  
  const unlockAudio = async () => {
    const success = await initializeAudioContext();
    if (success) {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    }
  };
  
  document.addEventListener('click', unlockAudio);
  document.addEventListener('touchstart', unlockAudio);
  document.addEventListener('keydown', unlockAudio);
}

// Set up audio unlock listeners on module load
setupAudioUnlockListeners();

/**
 * Fetch sound URLs from Supabase
 * @returns Record of sound names to URLs
 */
async function fetchSoundsFromSupabase(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from('sounds')
      .select('sounds_json')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data || !data.sounds_json) throw error;
    
    // Return the sounds directly - they should have full URLs
    return data.sounds_json;
  } catch (err) {
    logger.warn('Failed to fetch sounds from Supabase, using defaults:', err);
    // Fallback to local default if fetch fails
    return DEFAULT_SOUNDS;
  }
}

/**
 * Get sound URLs, with caching
 * @param forceRefresh Force refresh from Supabase
 * @returns Record of sound names to URLs
 */
export async function getSounds(forceRefresh = false): Promise<Record<string, string>> {
  if (cachedSounds && !forceRefresh) return cachedSounds;
  if (soundsPromise && !forceRefresh) return soundsPromise;
  
  soundsPromise = (async () => {
    const sounds = await fetchSoundsFromSupabase();
    cachedSounds = sounds;
    // Notify subscribers
    subscribers.forEach(fn => fn(sounds));
    return sounds;
  })();
  
  return soundsPromise;
}

/**
 * Subscribe to sound updates
 * @param cb Callback to receive updated sounds
 * @returns Unsubscribe function
 */
export function subscribeSounds(cb: (sounds: Record<string, string>) => void) {
  subscribers.push(cb);
  // Immediately call with cached if available
  if (cachedSounds) cb(cachedSounds);
  // Return unsubscribe
  return () => {
    const idx = subscribers.indexOf(cb);
    if (idx !== -1) subscribers.splice(idx, 1);
  };
}

// Poll for updates every minute (auto-update)
const AUTO_UPDATE_INTERVAL = 60 * 1000; // 1 minute
setInterval(() => {
  getSounds(true);
}, AUTO_UPDATE_INTERVAL);

/**
 * Get a specific sound URL
 * @param soundName Name of the sound (e.g., 'success', 'fail')
 * @returns URL for the sound file
 */
export async function getSound(soundName: string): Promise<string> {
  const sounds = await getSounds();
  return sounds[soundName] || DEFAULT_SOUNDS[soundName as keyof typeof DEFAULT_SOUNDS] || '';
}

/**
 * Preload sounds for better performance
 * @param soundNames Array of sound names to preload
 */
export async function preloadSounds(soundNames: string[]): Promise<void> {
  try {
    const sounds = await getSounds();
    
    for (const name of soundNames) {
      const url = sounds[name] || DEFAULT_SOUNDS[name as keyof typeof DEFAULT_SOUNDS];
      if (!url) continue;
      
      if (!preloadedSounds[name]) {
        const audio = new Audio(url);
        audio.volume = effectsVolume;
        // Load the audio but don't play it
        audio.load();
        preloadedSounds[name] = audio;
        logger.info(`Preloaded sound: ${name}`);
      }
    }
  } catch (err) {
    logger.error('Error preloading sounds:', err);
  }
}

/**
 * Check if background music is currently playing
 * @returns boolean indicating if background music is playing
 */
export function isBackgroundMusicPlaying(): boolean {
  return backgroundMusic !== null && 
         !backgroundMusic.paused && 
         backgroundMusic.currentTime > 0 &&
         !backgroundMusic.ended;
}

/**
 * Play a sound effect
 * @param soundName Name of the sound to play
 * @param volume Optional volume override (0-1)
 * @returns Promise that resolves when the sound starts playing
 */
export async function playSound(soundName: string): Promise<void> {
  try {
    // Initialize audio context if needed
    await initializeAudioContext();
    
    // Use preloaded sound if available
    if (preloadedSounds[soundName]) {
      const audio = preloadedSounds[soundName];
      audio.currentTime = 0; // Reset to beginning
      audio.volume = effectsVolume;
      await audio.play();
      return;
    }
    
    // Otherwise, get the sound URL and play it
    const soundUrl = await getSound(soundName);
    if (!soundUrl) return;
    
    const audio = new Audio(soundUrl);
    audio.volume = effectsVolume;
    await audio.play();
  } catch (err) {
    logger.error(`Error playing sound (${soundName}):`, err);
  }
}

/**
 * Play background music
 * @param soundName Name of the sound to play as background
 * @param loop Whether to loop the sound (default: true)
 * @returns Promise that resolves when the music starts playing
 */
export async function playBackgroundMusic(soundName: string, loop = true): Promise<void> {
  try {
    // Initialize audio context if needed
    await initializeAudioContext();
    
    // Stop any existing background music
    stopBackgroundMusic();
    
    // Get the sound URL
    const soundUrl = await getSound(soundName);
    logger.info(`[AUDIO] Attempting to play background music: ${soundName}, URL: ${soundUrl}`);
    
    // Create a new audio element
    backgroundMusic = new Audio(soundUrl);
    backgroundMusic.loop = loop;
    backgroundMusic.volume = musicVolume;
    
    // Apply mute state
    backgroundMusic.muted = isMusicMuted;
    
    // Play the music
    await backgroundMusic.play();
    logger.info(`[AUDIO] Background music started: ${soundName}`);
  } catch (err) {
    logger.error(`[AUDIO] Error playing background music (${soundName}):`, err);
    throw err; // Re-throw to allow caller to handle
  }
}

/**
 * Stop background music
 */
export function stopBackgroundMusic(): void {
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    backgroundMusic = null;
    logger.info('[AUDIO] Background music stopped');
  }
}

/**
 * Set mute state for background music
 * @param muted Whether to mute the background music
 */
export function setBackgroundMusicMuted(muted: boolean): void {
  isMusicMuted = muted;
  
  if (backgroundMusic) {
    backgroundMusic.muted = muted;
  }
  
  // Save mute state to localStorage
  localStorage.setItem('cipher-clash-music-muted', muted.toString());
}

/**
 * Set volume for background music
 * @param volume Volume level (0-1)
 */
export function setBackgroundMusicVolume(volume: number): void {
  musicVolume = Math.max(0, Math.min(1, volume));
  
  if (backgroundMusic) {
    backgroundMusic.volume = musicVolume;
  }
  
  // Save volume to localStorage
  localStorage.setItem('cipher-clash-music-volume', musicVolume.toString());
}

/**
 * Set volume for sound effects
 * @param volume Volume level (0-1)
 */
export function setSoundEffectsVolume(volume: number): void {
  effectsVolume = Math.max(0, Math.min(1, volume));
  
  // Update volume for all preloaded sounds
  Object.values(preloadedSounds).forEach(audio => {
    audio.volume = effectsVolume;
  });
  
  // Save volume to localStorage
  localStorage.setItem('cipher-clash-effects-volume', effectsVolume.toString());
}

/**
 * Get current volume settings
 * @returns Object with music and effects volume levels
 */
export function getVolumeSettings(): { music: number; effects: number } {
  return {
    music: musicVolume,
    effects: effectsVolume
  };
}

// Initialize volume settings from localStorage
export function initializeVolumeSettings(): void {
  const savedMusicVolume = localStorage.getItem('cipher-clash-music-volume');
  const savedEffectsVolume = localStorage.getItem('cipher-clash-effects-volume');
  
  if (savedMusicVolume) {
    musicVolume = parseFloat(savedMusicVolume);
  }
  
  if (savedEffectsVolume) {
    effectsVolume = parseFloat(savedEffectsVolume);
  }
  
  // Initialize mute state
  const savedMusicMuted = localStorage.getItem('cipher-clash-music-muted');
  if (savedMusicMuted) {
    isMusicMuted = savedMusicMuted === 'true';
  }
}

// Initialize volume settings on module load
initializeVolumeSettings(); 
import { supabase } from '@/integrations/supabase/client';
import logger from './logger';

// Default sound paths (fallback if Supabase fails)
const DEFAULT_SOUNDS = {
  intro: [
    'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/sounds//intro_sound.mp3',
    'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/sounds//intro_sound_2.mp3',
    'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/sounds//intro_sound_3.mp3'
  ],
  success: 'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/sounds//success_bell.mp3',
  failure: 'https://vppefmbjgvfwqqwomfeb.supabase.co/storage/v1/object/public/sounds//failure_bell.mp3'
};

// Sound data type can be either a string URL or an array of string URLs
type SoundData = string | string[];

// Cache for sound URLs
let cachedSounds: Record<string, SoundData> | null = null;
let soundsPromise: Promise<Record<string, SoundData>> | null = null;
const subscribers: ((sounds: Record<string, SoundData>) => void)[] = [];

// Background music instance using Howler.js
import { Howl, Howler } from 'howler';
let backgroundMusic: Howl | null = null;
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
async function fetchSoundsFromSupabase(): Promise<Record<string, SoundData>> {
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
export async function getSounds(forceRefresh = false): Promise<Record<string, SoundData>> {
  if (cachedSounds && !forceRefresh) return cachedSounds;
  if (soundsPromise && !forceRefresh) return soundsPromise;
  
  soundsPromise = (async () => {
    try {
      // Fetch the latest sounds_json from Supabase
      const { data, error } = await supabase
        .from('sounds')
        .select('sounds_json')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      if (data && data.sounds_json) {
        cachedSounds = data.sounds_json;
        return cachedSounds;
      }
      // Fallback to defaults if not found
      cachedSounds = DEFAULT_SOUNDS;
      return cachedSounds;
    } catch (err) {
      logger.error('Failed to fetch sounds from Supabase:', err);
      cachedSounds = DEFAULT_SOUNDS;
      return cachedSounds;
    }
  })();
  
  return soundsPromise;
}

/**
 * Subscribe to sound updates
 * @param cb Callback to receive updated sounds
 * @returns Unsubscribe function
 */
export function subscribeSounds(cb: (sounds: Record<string, SoundData>) => void) {
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
  const soundData = sounds[soundName] || DEFAULT_SOUNDS[soundName as keyof typeof DEFAULT_SOUNDS] || '';
  
  // Handle array of sound URLs (choose randomly)
  if (Array.isArray(soundData)) {
    if (soundData.length === 0) return '';
    // Pick a random sound from the array
    const randomIndex = Math.floor(Math.random() * soundData.length);
    logger.info(`[AUDIO] Randomly selected ${soundName} sound ${randomIndex + 1} of ${soundData.length}`);
    return soundData[randomIndex];
  }
  
  // Handle string URL
  return soundData;
}

/**
 * Preload sounds for better performance
 * @param soundNames Array of sound names to preload
 */
export async function preloadSounds(soundNames: string[]): Promise<void> {
  try {
    const sounds = await getSounds();
    
    for (const name of soundNames) {
      const soundData = sounds[name] || DEFAULT_SOUNDS[name as keyof typeof DEFAULT_SOUNDS];
      if (!soundData) continue;
      
      // Get the URL (handle both string and array)
      const url = Array.isArray(soundData) ? soundData[0] : soundData;
      
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
  return backgroundMusic !== null && backgroundMusic.playing();
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
 * Play background music using Howler.js
 * @param soundName Name of the sound to play as background
 * @param loop Whether to loop the sound (default: true)
 * @returns Promise that resolves when the music starts playing
 */
export async function playBackgroundMusic(soundName: string, loop = true): Promise<void> {
  if (backgroundMusic) {
    backgroundMusic.stop();
    backgroundMusic.unload();
    backgroundMusic = null;
  }
  const url = await getSound(soundName);
  backgroundMusic = new Howl({
    src: [url],
    loop,
    volume: musicVolume,
    mute: isMusicMuted
  });
  backgroundMusic.play();
}

/**
 * Stop background music using Howler.js
 */
export function stopBackgroundMusic(): void {
  if (backgroundMusic) {
    backgroundMusic.stop();
    backgroundMusic.unload();
    backgroundMusic = null;
  }
}

/**
 * Set mute state for background music using Howler.js
 */
export function setBackgroundMusicMuted(muted: boolean): void {
  isMusicMuted = muted;
  if (backgroundMusic) {
    backgroundMusic.mute(muted);
  }
}

/**
 * Set volume for background music using Howler.js
 */
export function setBackgroundMusicVolume(volume: number): void {
  musicVolume = volume;
  if (backgroundMusic) {
    backgroundMusic.volume(volume);
  }
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
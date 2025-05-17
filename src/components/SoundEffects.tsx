import React, { useEffect, useState } from 'react';
import logger from '../utils/logger';
import { getSound, subscribeSounds, preloadSounds, playSound } from '../utils/soundManager';

// Slightly lower volume for sound effects to avoid overpowering background music
const SOUND_EFFECT_VOLUME = 0.5;

interface SoundEffectsProps {
  gameState: 'idle' | 'showCode' | 'input' | 'result';
  isPlayerWinner: boolean | null;
  level: number;
  totalScore: number; // Add totalScore to check for milestone achievements
}

const SoundEffects: React.FC<SoundEffectsProps> = ({
  gameState,
  isPlayerWinner,
  level,
  totalScore
}) => {
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = localStorage.getItem('cipher-clash-muted');
    return savedMute === 'true';
  });

  // Play victory sound for notable milestones (levels divisible by 20)
  const isMilestone = level > 0 && level % 20 === 0;

  // Preload sound effects on component mount
  useEffect(() => {
    const loadSounds = async () => {
      try {
        // Preload all game sounds
        await preloadSounds(['success', 'fail', 'victory', 'intro']);
        logger.info('Sound effects preloaded');
      } catch (err) {
        logger.error('Error preloading sound effects:', err);
      }
    };
    
    loadSounds();
    
    // Subscribe to sound updates
    const unsubscribe = subscribeSounds(async (sounds) => {
      // When sounds update, preload them again
      await preloadSounds(['success', 'fail', 'victory', 'intro']);
      logger.info('Sound effects updated and preloaded');
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Listen for mute change events
  useEffect(() => {
    const handleMuteChange = (e: CustomEvent) => {
      setIsMuted(e.detail.muted);
    };

    window.addEventListener('audio-mute-change', handleMuteChange as EventListener);

    return () => {
      window.removeEventListener('audio-mute-change', handleMuteChange as EventListener);
    };
  }, []);

  // Play sound effects based on game state changes
  useEffect(() => {
    if (gameState === 'result' && !isMuted) {
      try {
        // For milestone levels (every 20 levels)
        if (isMilestone && isPlayerWinner) {
          playSound('victory', SOUND_EFFECT_VOLUME).catch(err => logger.error("Error playing victory sound:", err));
        }
        // For regular success
        else if (isPlayerWinner) {
          playSound('success', SOUND_EFFECT_VOLUME).catch(err => logger.error("Error playing success sound:", err));
        }
        // For failure
        else if (!isPlayerWinner) {
          playSound('fail', SOUND_EFFECT_VOLUME).catch(err => logger.error("Error playing fail sound:", err));
        }
      } catch (e) {
        logger.error("Audio playback error:", e);
      }
    }
  }, [gameState, isPlayerWinner, isMuted, isMilestone]);

  // Component doesn't render anything, just handles audio
  return null;
};

export default SoundEffects;

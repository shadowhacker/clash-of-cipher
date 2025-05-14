import React, { useEffect, useRef, useState } from 'react';
import { MAX_LEVELS } from '../config/gameConfig';

interface SoundEffectsProps {
  gameState: 'idle' | 'showCode' | 'input' | 'result';
  isPlayerWinner: boolean | null;
  level: number; // Add level to check for victory condition
}

const SoundEffects: React.FC<SoundEffectsProps> = ({
  gameState,
  isPlayerWinner,
  level
}) => {
  // Sound effects using useRef for better performance
  const sfxSuccess = useRef<HTMLAudioElement | null>(null);
  const sfxFail = useRef<HTMLAudioElement | null>(null);
  const sfxVictory = useRef<HTMLAudioElement | null>(null); // New victory sound
  const audioInitialized = useRef<boolean>(false);
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = localStorage.getItem('cipher-clash-muted');
    return savedMute === 'true';
  });

  // Check if player completed all levels
  const completedAllLevels = level >= MAX_LEVELS;

  // Initialize sound effects
  useEffect(() => {
    sfxSuccess.current = new Audio('/snd/success.mp3');
    sfxFail.current = new Audio('/snd/fail.mp3');
    sfxVictory.current = new Audio('/snd/victory.mp3'); // Add a victory sound file
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
        // For game victory (all levels completed)
        if (completedAllLevels && sfxVictory.current) {
          sfxVictory.current.play().catch(err => console.error("Error playing victory sound:", err));
        }
        // For regular success
        else if (isPlayerWinner && sfxSuccess.current) {
          sfxSuccess.current.play().catch(err => console.error("Error playing success sound:", err));
        }
        // For failure
        else if (!isPlayerWinner && sfxFail.current) {
          sfxFail.current.play().catch(err => console.error("Error playing fail sound:", err));
        }
      } catch (e) {
        console.error("Audio playback error:", e);
      }
    }
  }, [gameState, isPlayerWinner, isMuted, completedAllLevels]);

  // Component doesn't render anything, just handles audio
  return null;
};

export default SoundEffects;

import React, { useEffect, useRef, useState } from 'react';

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
  // Sound effects using useRef for better performance
  const sfxSuccess = useRef<HTMLAudioElement | null>(null);
  const sfxFail = useRef<HTMLAudioElement | null>(null);
  const sfxVictory = useRef<HTMLAudioElement | null>(null); // Victory sound for milestones
  const audioInitialized = useRef<boolean>(false);
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = localStorage.getItem('cipher-clash-muted');
    return savedMute === 'true';
  });

  // Play victory sound for notable milestones (levels divisible by 20)
  const isMilestone = level > 0 && level % 20 === 0;

  // Initialize sound effects
  useEffect(() => {
    sfxSuccess.current = new Audio('/snd/success.mp3');
    sfxFail.current = new Audio('/snd/fail.mp3');
    sfxVictory.current = new Audio('/snd/victory.mp3');
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
        if (isMilestone && isPlayerWinner && sfxVictory.current) {
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
  }, [gameState, isPlayerWinner, isMuted, isMilestone]);

  // Component doesn't render anything, just handles audio
  return null;
};

export default SoundEffects;

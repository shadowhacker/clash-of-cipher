import React, { useEffect, useRef, useState } from 'react';

interface SoundEffectsProps {
  gameState: 'idle' | 'showCode' | 'input' | 'result';
  isPlayerWinner: boolean | null;
}

const SoundEffects: React.FC<SoundEffectsProps> = ({ gameState, isPlayerWinner }) => {
  // Sound effects using useRef for better performance
  const sfxSuccess = useRef<HTMLAudioElement | null>(null);
  const sfxFail = useRef<HTMLAudioElement | null>(null);
  const audioInitialized = useRef<boolean>(false);
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = localStorage.getItem('cipher-clash-muted');
    return savedMute === 'true';
  });

  // Initialize sound effects
  useEffect(() => {
    sfxSuccess.current = new Audio('/snd/success.mp3');
    sfxFail.current = new Audio('/snd/fail.mp3');
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
        if (isPlayerWinner && sfxSuccess.current) {
          sfxSuccess.current.play().catch(err => console.error("Error playing success sound:", err));
        } else if (!isPlayerWinner && sfxFail.current) {
          sfxFail.current.play().catch(err => console.error("Error playing fail sound:", err));
        }
      } catch (e) {
        console.error("Audio playback error:", e);
      }
    }
  }, [gameState, isPlayerWinner, isMuted]);

  // Component doesn't render anything, just handles audio
  return null;
};

export default SoundEffects;

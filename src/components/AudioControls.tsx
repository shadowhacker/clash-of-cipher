import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import GameButton from './GameButton';

interface AudioControlsProps {
  className?: string;
}

const AudioControls: React.FC<AudioControlsProps> = ({ className = '' }) => {
  const [isMuted, setIsMuted] = useState(() => {
    // Check localStorage for existing preference
    const savedMute = localStorage.getItem('cipher-clash-muted');
    return savedMute === 'true';
  });

  // Toggle mute state
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    // Save preference to localStorage
    localStorage.setItem('cipher-clash-muted', newMuted.toString());

    // Set global audio state via a custom event
    window.dispatchEvent(new CustomEvent('audio-mute-change', { detail: { muted: newMuted } }));
  };

  return (
    <GameButton
      onClick={toggleMute}
      icon={isMuted ? (
        <VolumeX className="w-5 h-5" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
      label={isMuted ? "Unmute sounds" : "Mute sounds"}
      className={className}
    />
  );
};

export default AudioControls; 
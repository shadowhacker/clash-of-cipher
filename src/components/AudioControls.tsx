import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

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
    <button
      onClick={toggleMute}
      className={`p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors ${className}`}
      aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
      title={isMuted ? "Unmute sounds" : "Mute sounds"}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-amber-400" />
      ) : (
        <Volume2 className="w-5 h-5 text-amber-400" />
      )}
    </button>
  );
};

export default AudioControls; 
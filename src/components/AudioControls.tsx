import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Music2, Settings } from 'lucide-react';
import GameButton from './GameButton';
import { setBackgroundMusicMuted } from '../utils/soundManager';
import VolumeControl from './VolumeControl';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AudioControlsProps {
  className?: string;
}

const AudioControls: React.FC<AudioControlsProps> = ({ className = '' }) => {
  const [isMuted, setIsMuted] = useState(() => {
    // Check localStorage for existing preference
    const savedMute = localStorage.getItem('cipher-clash-muted');
    return savedMute === 'true';
  });
  
  const [isMusicMuted, setIsMusicMuted] = useState(() => {
    // Check localStorage for existing preference
    const savedMusicMute = localStorage.getItem('cipher-clash-music-muted');
    return savedMusicMute === 'true';
  });

  // Initialize music mute state on component mount
  useEffect(() => {
    setBackgroundMusicMuted(isMusicMuted);
  }, []);

  // Toggle sound effects mute state
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    // Save preference to localStorage
    localStorage.setItem('cipher-clash-muted', newMuted.toString());

    // Set global audio state via a custom event
    window.dispatchEvent(new CustomEvent('audio-mute-change', { 
      detail: { 
        muted: newMuted,
        musicEnabled: !isMusicMuted
      }
    }));
  };
  
  // Toggle background music mute state
  const toggleMusicMute = () => {
    const newMusicMuted = !isMusicMuted;
    setIsMusicMuted(newMusicMuted);
    
    // Update background music state
    setBackgroundMusicMuted(newMusicMuted);
    
    // Save preference to localStorage
    localStorage.setItem('cipher-clash-music-muted', newMusicMuted.toString());
    
    // Update global audio state
    window.dispatchEvent(new CustomEvent('audio-mute-change', { 
      detail: { 
        muted: isMuted,
        musicEnabled: !newMusicMuted
      }
    }));
  };

  return (
    <div className="flex space-x-2">
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
      
      <GameButton
        onClick={toggleMusicMute}
        icon={isMusicMuted ? (
          <Music2 className="w-5 h-5" />
        ) : (
          <Music className="w-5 h-5" />
        )}
        label={isMusicMuted ? "Unmute music" : "Mute music"}
        className={className}
      />
      
      <Popover>
        <PopoverTrigger asChild>
          <div>
            <GameButton
              onClick={() => {}}
              icon={<Settings className="w-5 h-5" />}
              label="Volume settings"
              className={className}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <VolumeControl />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AudioControls; 
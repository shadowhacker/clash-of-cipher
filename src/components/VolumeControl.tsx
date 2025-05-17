import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { 
  getVolumeSettings, 
  setBackgroundMusicVolume, 
  setSoundEffectsVolume,
  playSound
} from '../utils/soundManager';
import { Volume, Music } from 'lucide-react';

interface VolumeControlProps {
  className?: string;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ className = '' }) => {
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [effectsVolume, setEffectsVolume] = useState(0.7);
  
  // Initialize volume settings on component mount
  useEffect(() => {
    const settings = getVolumeSettings();
    setMusicVolume(settings.music);
    setEffectsVolume(settings.effects);
  }, []);
  
  // Handle music volume change
  const handleMusicVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setMusicVolume(newVolume);
    setBackgroundMusicVolume(newVolume);
  };
  
  // Handle effects volume change
  const handleEffectsVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setEffectsVolume(newVolume);
    setSoundEffectsVolume(newVolume);
    
    // Play a sample sound to demonstrate the new volume
    playSound('success');
  };
  
  return (
    <div className={`p-4 bg-amber-900/30 rounded-lg border border-amber-700/40 ${className}`}>
      <h3 className="text-amber-200 font-medium mb-4">Volume Settings</h3>
      
      {/* Music Volume Control */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Music className="w-4 h-4 text-amber-400 mr-2" />
          <span className="text-amber-200 text-sm">Music Volume</span>
        </div>
        <Slider
          defaultValue={[musicVolume]}
          max={1}
          step={0.01}
          value={[musicVolume]}
          onValueChange={handleMusicVolumeChange}
          className="w-full"
        />
      </div>
      
      {/* Sound Effects Volume Control */}
      <div>
        <div className="flex items-center mb-2">
          <Volume className="w-4 h-4 text-amber-400 mr-2" />
          <span className="text-amber-200 text-sm">Sound Effects Volume</span>
        </div>
        <Slider
          defaultValue={[effectsVolume]}
          max={1}
          step={0.01}
          value={[effectsVolume]}
          onValueChange={handleEffectsVolumeChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default VolumeControl; 
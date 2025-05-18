
import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { 
  getVolumeSettings, 
  setBackgroundMusicVolume, 
  setSoundEffectsVolume,
  playSound
} from '../utils/soundManager';
import { Volume, Volume2, VolumeX, Music, Music2 } from 'lucide-react';

interface VolumeControlProps {
  className?: string;
  isMuted?: boolean;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ className = '', isMuted = false }) => {
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
      {/* Audio icons row for clarity */}
      <div className="flex justify-center gap-4 mb-3">
        <span className="flex flex-col items-center">
          <Volume2 className="w-6 h-6 text-amber-300" />
          <span className="text-xs text-amber-200 mt-1">Volume</span>
        </span>
        <span className="flex flex-col items-center">
          <VolumeX className="w-6 h-6 text-amber-400" />
          <span className="text-xs text-amber-200 mt-1">Muted</span>
        </span>
        <span className="flex flex-col items-center">
          <Music className="w-6 h-6 text-amber-300" />
          <span className="text-xs text-amber-200 mt-1">Music</span>
        </span>
        <span className="flex flex-col items-center">
          <Music2 className="w-6 h-6 text-amber-400" />
          <span className="text-xs text-amber-200 mt-1">Music Off</span>
        </span>
      </div>
      <h3 className="text-amber-200 font-medium mb-4">Volume Settings</h3>
      {isMuted ? (
        <div className="flex flex-col items-center justify-center py-8">
          <VolumeX className="w-8 h-8 text-amber-400 mb-2" />
          <span className="text-amber-300 text-lg font-semibold">All audio is muted</span>
          <span className="text-amber-200 text-sm mt-1">Unmute to adjust volume</span>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default VolumeControl; 
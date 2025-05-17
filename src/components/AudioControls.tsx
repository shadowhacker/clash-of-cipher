import * as React from 'react';
import { useState, useEffect } from 'react';
import { Volume, Volume2, VolumeX, Music, Music2, Settings } from 'lucide-react';
import GameButton from './GameButton';
import { setBackgroundMusicMuted, getVolumeSettings, setBackgroundMusicVolume, setSoundEffectsVolume, playSound } from '../utils/soundManager';
import { Slider } from '@/components/ui/slider';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AudioControlsProps {
  className?: string;
}

const AudioControls: React.FC<AudioControlsProps> = ({ className = '' }) => {
  // Unified mute state for both effects and music
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = localStorage.getItem('cipher-clash-muted');
    return savedMute === 'true';
  });
  
  const [isMusicMuted, setIsMusicMuted] = useState(() => {
    const saved = localStorage.getItem('cipher-clash-music-muted');
    return saved === 'true';
  });
  const [isEffectsMuted, setIsEffectsMuted] = useState(() => {
    const saved = localStorage.getItem('cipher-clash-effects-muted');
    return saved === 'true';
  });

  // Initialize mute state for both music and effects on mount
  useEffect(() => {
    setBackgroundMusicMuted(isMuted);
  }, []);

  // Unified mute toggle for both effects and music
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setBackgroundMusicMuted(newMuted);
    localStorage.setItem('cipher-clash-muted', newMuted.toString());
    // Also mute both music and effects separately
    setIsMusicMuted(newMuted);
    setIsEffectsMuted(newMuted);
    localStorage.setItem('cipher-clash-music-muted', newMuted.toString());
    localStorage.setItem('cipher-clash-effects-muted', newMuted.toString());
    window.dispatchEvent(new CustomEvent('audio-mute-change', {
      detail: {
        muted: newMuted,
        musicEnabled: !newMuted
      }
    }));
  };
  // Toggle music mute
  const toggleMusicMute = () => {
    const newMusicMuted = !isMusicMuted;
    setIsMusicMuted(newMusicMuted);
    setBackgroundMusicMuted(newMusicMuted);
    localStorage.setItem('cipher-clash-music-muted', newMusicMuted.toString());
    window.dispatchEvent(new CustomEvent('audio-mute-change', {
      detail: {
        muted: isMuted,
        musicEnabled: !newMusicMuted
      }
    }));
  };
  // Toggle effects mute
  const toggleEffectsMute = () => {
    const newEffectsMuted = !isEffectsMuted;
    setIsEffectsMuted(newEffectsMuted);
    localStorage.setItem('cipher-clash-effects-muted', newEffectsMuted.toString());
    window.dispatchEvent(new CustomEvent('audio-mute-change', {
      detail: {
        muted: isMuted,
        musicEnabled: !isMusicMuted
      }
    }));
  };

  // Volume logic (moved from VolumeControl)
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [effectsVolume, setEffectsVolume] = useState(0.7);
  useEffect(() => {
    const settings = getVolumeSettings();
    setMusicVolume(settings.music);
    setEffectsVolume(settings.effects);
  }, []);
  const handleMusicVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setMusicVolume(newVolume);
    setBackgroundMusicVolume(newVolume);
  };
  const handleEffectsVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setEffectsVolume(newVolume);
    setSoundEffectsVolume(newVolume);
    playSound('success');
  };


  return (
    <div className="flex space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <div>
            <GameButton
              onClick={() => {}}
              icon={<Settings className="w-5 h-5" />}
              label="Audio Settings"
              className={className}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-96 max-w-[96vw] p-0 bg-gradient-to-br from-[#1a0d05]/95 via-[#2d1a0a]/90 to-[#0e0817]/90 border-amber-700/60 rounded-2xl shadow-2xl">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <Settings className="w-6 h-6 text-amber-400" />
              <h3 className="text-amber-200 text-xl font-bold tracking-wide" style={{fontFamily:'Rajdhani'}}>Audio Settings</h3>
            </div>

            {/* Mute toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {isMuted ? <VolumeX className="w-6 h-6 text-amber-400" /> : <Volume2 className="w-6 h-6 text-amber-300" />}
                <span className="text-amber-100 text-lg font-medium">{isMuted ? 'All Audio Muted' : 'All Audio On'}</span>
              </div>
              <button
                onClick={toggleMute}
                className={`transition-colors px-4 py-2 rounded-lg font-semibold text-sm ${isMuted ? 'bg-amber-900 text-amber-400 border border-amber-700' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
                aria-label={isMuted ? 'Unmute All Audio' : 'Mute All Audio'}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>

            {/* Volume sliders */}
            {isMuted ? (
              <div className="flex flex-col items-center justify-center py-8">
                <VolumeX className="w-8 h-8 text-amber-400 mb-2" />
                <span className="text-amber-300 text-lg font-semibold">All audio is muted</span>
                <span className="text-amber-200 text-sm mt-1">Unmute to adjust volume</span>
              </div>
            ) : (
              <>
                {/* Music Volume */}
                <div className="mb-6">
                  <div className="flex items-center mb-2 gap-2">
                    <Music className="w-5 h-5 text-amber-300" />
                    <span className="text-amber-100 text-base">Music Volume</span>
                    <button
                      onClick={toggleMusicMute}
                      className={`ml-2 p-1 rounded-full border border-amber-700 hover:bg-amber-800 transition-colors ${isMusicMuted ? 'bg-amber-900' : 'bg-amber-500'}`}
                      aria-label={isMusicMuted ? 'Unmute Music' : 'Mute Music'}
                    >
                      {isMusicMuted ? <Music2 className="w-4 h-4 text-amber-400" /> : <Music className="w-4 h-4 text-amber-100" />}
                    </button>
                  </div>
                  <Slider
                    defaultValue={[musicVolume]}
                    max={1}
                    step={0.01}
                    value={[musicVolume]}
                    onValueChange={handleMusicVolumeChange}
                    className={`w-full themed-slider ${isMusicMuted ? 'opacity-40 grayscale' : ''}`}
                    disabled={isMusicMuted}
                  />
                </div>
                {/* Effects Volume */}
                <div>
                  <div className="flex items-center mb-2 gap-2">
                    <Volume className="w-5 h-5 text-amber-300" />
                    <span className="text-amber-100 text-base">Effects Volume</span>
                    <button
                      onClick={toggleEffectsMute}
                      className={`ml-2 p-1 rounded-full border border-amber-700 hover:bg-amber-800 transition-colors ${isEffectsMuted ? 'bg-amber-900' : 'bg-amber-500'}`}
                      aria-label={isEffectsMuted ? 'Unmute Effects' : 'Mute Effects'}
                    >
                      {isEffectsMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-amber-100" />}
                    </button>
                  </div>
                  <Slider
                    defaultValue={[effectsVolume]}
                    max={1}
                    step={0.01}
                    value={[effectsVolume]}
                    onValueChange={value => {
                      setEffectsVolume(value[0]);
                      setSoundEffectsVolume(value[0]);
                      playSound('success');
                    }}
                    className={`w-full themed-slider ${isEffectsMuted ? 'opacity-40 grayscale' : ''}`}
                    disabled={isEffectsMuted}
                  />
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AudioControls; 
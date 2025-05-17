import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface StartScreenProps {
  onStart: () => void;
  onHowToPlay?: () => void;
}

const HOW_TO_PLAY_STEPS = [
  {
    icon: '👁️',
    title: 'Watch',
    desc: 'Symbols will flash on the screen one by one. Pay close attention!'
  },
  {
    icon: '🧠',
    title: 'Memorize',
    desc: 'Remember the order in which the symbols appear.'
  },
  {
    icon: '🖐️',
    title: 'Repeat',
    desc: 'Tap the symbols in the EXACT SAME ORDER as you saw them.'
  }
];

const ANIMATION_DURATION = 5000;

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onHowToPlay }) => {
  const [ctaEnabled, setCtaEnabled] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    setCtaEnabled(false);
    setProgress(0);
    let start: number | null = null;
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const percent = Math.min(elapsed / ANIMATION_DURATION, 1);
      setProgress(percent);
      if (percent < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        setProgress(1); // Ensure visually 100%
        setTimeout(() => setCtaEnabled(true), 50); // Enable after fill is visually complete
      }
    };
    animationFrame.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1a0d05] via-[#0e0817] to-[#1a0d05]">
      <div className="w-full max-w-lg p-8 text-center bg-gradient-to-br from-[#1a0d05]/90 via-[#2d1a0a]/80 to-[#0e0817]/80 rounded-3xl shadow-2xl border-4 border-amber-700/60 backdrop-blur-xl relative overflow-hidden">
        {/* Funky background shapes */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-700/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-indigo-900/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-amber-900/10 via-indigo-900/10 to-amber-800/10 rounded-full blur-3xl" />

        <h1 className="text-5xl font-extrabold mb-2 text-amber-400 flex items-center justify-center gap-2 drop-shadow-xl tracking-tight" style={{letterSpacing: '-0.03em'}}>
          <span className="text-6xl animate-spin-slow">🧘</span> Dhyanam
        </h1>
        <p className="mb-7 text-lg text-amber-200 font-semibold italic drop-shadow-sm">The ancient memory practice of spiritual mastery</p>

        {/* How to Play Card */}
        <div className="mb-10 bg-gradient-to-br from-amber-900/80 via-amber-800/70 to-amber-700/60 rounded-2xl p-6 shadow-xl border-2 border-amber-700/70 relative">
          <h2 className="text-2xl font-extrabold text-amber-200 mb-4 flex items-center gap-2 justify-center tracking-tight">
            <span className="text-3xl animate-bounce">✨</span> How to Play
          </h2>
          <ol className="space-y-4">
            {HOW_TO_PLAY_STEPS.map((step, idx) => (
              <li key={idx} className="flex items-start gap-4">
                <span className="text-3xl mt-0.5 animate-pop">{step.icon}</span>
                <div className="text-left">
                  <span className="font-bold text-amber-100 text-lg">{step.title}:</span>
                  <span className="ml-2 text-amber-200 text-base">{step.desc}</span>
                </div>
              </li>
            ))}
          </ol>
          {/* Funky underline squiggle */}
          <div className="mt-5 flex justify-center">
            <svg width="120" height="16" viewBox="0 0 120 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 8C12 2 24 14 34 8C44 2 56 14 66 8C76 2 88 14 98 8C108 2 118 14 118 14" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Main CTA with animated fill */}
        <div className="border-t-2 border-amber-700/40 pt-7 mt-7 relative">
          <div className="relative w-full h-16 mb-2">
            <Button
              onClick={onStart}
              className={`w-full h-16 text-xl font-extrabold rounded-2xl transition-all duration-300 tracking-wide shadow-xl overflow-hidden relative ${ctaEnabled ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-amber-900 text-amber-400 cursor-not-allowed opacity-80'}`}
              disabled={!ctaEnabled}
              style={{letterSpacing: '0.04em'}}
            >
              <span className="relative z-10">{ctaEnabled ? 'BEGIN YOUR TAPASYA' : 'Please wait...'}</span>
              {/* Progress fill animation */}
              {!ctaEnabled && (
                <span
                  className="absolute left-0 top-0 h-full bg-amber-400/80 transition-all duration-300"
                  style={{ width: `${progress * 100}%`, zIndex: 1, borderRadius: '1rem' }}
                />
              )}
            </Button>
          </div>

          {/* How to Play CTA - more prominent, no '?' icon */}
          <Button
            onClick={onHowToPlay}
            className="w-full mt-5 py-4 text-lg font-extrabold rounded-2xl bg-indigo-900 text-amber-200 border-2 border-indigo-800 shadow-lg hover:bg-indigo-800 hover:text-amber-100 transition-all tracking-wide"
            style={{ fontSize: '1.18rem', letterSpacing: '0.01em' }}
          >
            How to Play (Full Guide)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;

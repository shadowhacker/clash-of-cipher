import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { useEffect, useState } from 'react';
import { getInitialCountdown } from '../config/gameConfig';

interface LaunchCountdownProps {
  onComplete: () => void;
}

const LaunchCountdown: React.FC<LaunchCountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState(getInitialCountdown());
  const { config, loading } = useRemoteConfig();

  useEffect(() => {
    // Start countdown
    const timer = setInterval(() => {
      setCount((prevCount) => {
        // When we reach zero, clear interval and trigger completion
        if (prevCount <= 1) {
          clearInterval(timer);
          // Schedule the onComplete callback after the render cycle
          setTimeout(() => {
            onComplete();
          }, 0);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, [onComplete]);

  const rules = config?.rules_text || [
    '1. Watch the symbols and remember their order.',
    '2. Tap the symbols in the same order.',
    '3. Get it right to go to the next round!'
  ];

  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center bg-black/90 z-[999]">
      <div className="text-8xl text-white font-bold animate-pulse mb-8">
        {count > 0 ? count : 'Go!'}
      </div>
      <div className="w-full max-w-md bg-black/60 rounded-xl p-6 text-center mt-2">
        <h2 className="text-2xl font-bold text-amber-400 mb-4">How to Play</h2>
        {loading ? (
          <div className="text-amber-100">Loading rules...</div>
        ) : (
          <ul className="text-lg text-amber-100 space-y-2">
            {rules.map((rule: string, idx: number) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LaunchCountdown;
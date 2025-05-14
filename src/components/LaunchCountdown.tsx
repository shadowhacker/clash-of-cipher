import { useEffect, useState } from 'react';

interface LaunchCountdownProps {
  onComplete: () => void;
}

const LaunchCountdown: React.FC<LaunchCountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState(3);

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

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/70 z-[999]">
      <div className="text-8xl text-white font-bold animate-pulse">
        {count > 0 ? count : 'Go!'}
      </div>
    </div>
  );
};

export default LaunchCountdown; 
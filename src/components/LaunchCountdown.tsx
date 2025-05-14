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
                    onComplete();
                    return 0;
                }
                return prevCount - 1;
            });
        }, 1000);

        // Cleanup
        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <div className="launch-countdown">
            <div className="countdown-number">{count > 0 ? count : 'Go!'}</div>
            <style jsx>{`
        .launch-countdown {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(0, 0, 0, 0.7);
          z-index: 999;
        }
        .countdown-number {
          font-size: 8rem;
          color: white;
          font-weight: bold;
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
        </div>
    );
};

export default LaunchCountdown; 
import React, { useRef, useEffect } from 'react';

interface GuideScreenProps {
  onClose: () => void;
  isFirstTime: boolean;
  open: boolean;
}

// Custom CSS for scrollbars
const scrollbarStyles = `
  .thin-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .thin-scrollbar::-webkit-scrollbar-track {
    background: #fef3c7;
  }
  .thin-scrollbar::-webkit-scrollbar-thumb {
    background-color: #b45309;
    border-radius: 20px;
    border: 2px solid #fef3c7;
  }
`;

const GuideScreen: React.FC<GuideScreenProps> = ({ onClose, isFirstTime, open }) => {
  // Create ref for the dialog content to track clicks
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-4">
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div
        ref={dialogRef}
        className="bg-amber-100 rounded-xl overflow-hidden w-full max-w-md flex flex-col shadow-2xl"
        style={{ maxHeight: 'calc(100vh - 40px)' }}
      >
        <div
          className="overflow-auto flex-grow thin-scrollbar"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#b45309 #fef3c7',
          }}
        >
          <img
            src="/images/how-to-play.png"
            alt="How to Play Instructions"
            className="w-full h-auto"
          />
        </div>

        <div className="p-4 bg-amber-100 sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-amber-100 font-semibold rounded-lg transition-colors"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuideScreen; 
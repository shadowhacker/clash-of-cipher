import React, { useRef, useEffect } from 'react';
import TextGuide from './TextGuide';

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
        <div className="bg-amber-700 py-2 px-4">
          <h2 className="text-amber-50 text-xl font-bold text-center">Game Guide</h2>
        </div>

        <div className="overflow-auto thin-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#b45309 #fef3c7' }}>
          <TextGuide onSwitchToImage={() => {}} />
        </div>

        <div className="p-4 bg-amber-700 sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-lg transition-colors"
          >
            Back to Game
          </button>
          <p className="text-amber-100 text-xs text-center mt-2">
            (You can access this guide anytime by clicking the ? icon)
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuideScreen; 
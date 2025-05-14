import React, { useRef, useEffect, useState } from 'react';
import { useImageCache } from '../hooks/useImageCache';

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
  const imageSrc = "/images/how-to-play.png";
  const { status, cachedUrl } = useImageCache(imageSrc);

  const loading = status === 'loading';
  const error = status === 'error';

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
          className="overflow-auto flex-grow thin-scrollbar relative"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#b45309 #fef3c7',
            minHeight: '50vh',
          }}
        >
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-950/10">
              <div className="h-12 w-12 rounded-full border-4 border-amber-700 border-t-transparent animate-spin"></div>
              <p className="mt-4 text-amber-800 font-medium">Loading guide...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-950/10 p-4">
              <p className="text-amber-800 font-medium text-center">
                Could not load the guide image. Please check your connection and try again.
              </p>
            </div>
          )}

          <img
            src={cachedUrl}
            alt="How to Play Instructions"
            className={`w-full h-auto ${loading ? 'opacity-20' : 'opacity-100'}`}
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
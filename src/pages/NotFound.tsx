import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import logger from '../utils/logger';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    logger.error(`404 - Page not found: ${window.location.pathname}`);
  }, []);

  // Handle back button navigation
  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'radial-gradient(circle, #1a0d05 0%, #0e0817 100%)',
        backgroundSize: 'cover'
      }}
    >
      <div className="text-center p-8 rounded-lg backdrop-blur-sm bg-black/30 border border-amber-900/30 shadow-xl max-w-md w-full">
        <div className="mb-6">
          <h1 className="text-7xl font-bold mb-2 text-amber-500">404</h1>
          <div className="h-1 w-24 bg-amber-500/50 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold mb-2 text-amber-100">Path Not Found</h2>
          <p className="text-amber-200/70 mb-8">The spiritual journey you seek does not exist in this realm.</p>
        </div>

        <Button
          onClick={handleBackToHome}
          className="bg-amber-700 hover:bg-amber-600 text-amber-50 border-amber-500/50 px-6 py-2 rounded-md flex items-center justify-center gap-2 w-full transition-all duration-300"
        >
          <Home size={18} />
          Return to Sanctuary
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

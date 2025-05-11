import React from 'react';

interface GuideScreenProps {
  onClose: () => void;
  isFirstTime: boolean;
  open: boolean;
}

const GuideScreen: React.FC<GuideScreenProps> = ({ onClose, isFirstTime, open }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">How to Play</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <p className="text-lg">Memorize the symbols</p>
                  <p className="text-sm text-gray-600">Flash time oscillates between 1.2s and 2.0s every 20 levels</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <p className="text-lg">Repeat them within 10 s</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <p className="text-lg">You get 2 lives—each mistake costs 1</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">4️⃣</span>
                <p className="text-lg">Score climbs every correct round</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">5️⃣</span>
                <p className="text-lg">💎 Gems drop every 10 rounds, 🔥 Jackpot every 20</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Points Cheat-Sheet</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Base = round number</li>
                <li>• + Speed — finish faster, earn up to ×2</li>
                <li>• + Streak — flawless rounds stack +25% each</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {isFirstTime ? "Let's Play!" : "Got it!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideScreen; 
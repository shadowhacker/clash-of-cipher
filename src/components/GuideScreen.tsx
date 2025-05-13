
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
      <div className="bg-gradient-to-b from-indigo-950 to-amber-950 rounded-xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto border border-amber-700">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-amber-500">Path of Meditation</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-amber-500">1️⃣</span>
                <div>
                  <p className="text-lg text-amber-300">Meditate on the symbols</p>
                  <p className="text-sm text-amber-400/70">Flash time oscillates between 1.2s and 2.0s every 20 levels</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl text-amber-500">2️⃣</span>
                <p className="text-lg text-amber-300">Repeat them within 10 seconds</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl text-amber-500">3️⃣</span>
                <p className="text-lg text-amber-300">You get 2 lives—each mistake costs 1</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl text-amber-500">4️⃣</span>
                <p className="text-lg text-amber-300">Score climbs every correct round</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl text-amber-500">5️⃣</span>
                <p className="text-lg text-amber-300">💎 Gems drop every 10 rounds, 🔥 Jackpot every 20</p>
              </div>
            </div>

            <div className="bg-amber-950/40 p-4 rounded-lg border border-amber-800/50">
              <h3 className="font-semibold text-amber-400 mb-2">Points Cheat-Sheet</h3>
              <ul className="space-y-2 text-amber-300">
                <li>• Base = round number</li>
                <li>• + Speed — finish faster, earn up to ×2</li>
                <li>• + Streak — flawless rounds stack +25% each</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-amber-600 text-amber-100 rounded-lg hover:bg-amber-700 transition-colors"
            >
              {isFirstTime ? "Begin Journey" : "Understood"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideScreen;

import React from 'react';

const TextGuide: React.FC = () => {
  return (
    <div className="bg-amber-50 p-4 rounded-lg space-y-5 text-amber-900">
      <h2 className="text-xl font-bold text-center mb-4">Game Instructions</h2>
      
      <div className="bg-amber-100 p-3 rounded-lg border border-amber-300">
        <h3 className="font-bold text-lg mb-2 text-amber-800">Step 1: Watch</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Symbols will appear on screen one by one</li>
          <li>Each symbol shows for a brief moment</li>
          <li>Pay close attention to their order</li>
        </ul>
      </div>
      
      <div className="bg-amber-100 p-3 rounded-lg border border-amber-300">
        <h3 className="font-bold text-lg mb-2 text-amber-800">Step 2: Remember</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>The symbols will disappear after they've all been shown</li>
          <li>Try to keep the sequence in your memory</li>
        </ul>
      </div>
      
      <div className="bg-amber-100 p-3 rounded-lg border border-amber-300">
        <h3 className="font-bold text-lg mb-2 text-amber-800">Step 3: Repeat</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>A grid of symbols will appear</li>
          <li>Tap the symbols in the EXACT SAME ORDER as they were shown</li>
          <li>Green indicator means correct choice</li>
          <li>Red indicator means incorrect choice</li>
        </ul>
      </div>
    </div>
  );
};

export default TextGuide; 

import React from 'react';

export const Avatar: React.FC = () => {
  return (
    <div className="w-14 h-14 relative flex items-center justify-center bg-indigo-600/20 rounded-2xl shadow-inner border border-white/5 overflow-hidden">
      <span className="text-3xl filter drop-shadow-md">✨</span>
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent"></div>
    </div>
  );
};

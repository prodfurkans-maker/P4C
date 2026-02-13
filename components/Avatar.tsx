
import React from 'react';

export const Avatar: React.FC = () => {
  return (
    <div className="w-10 h-10 relative flex items-center justify-center bg-indigo-600/20 rounded-xl border border-white/5 overflow-hidden">
      <span className="text-xl">✨</span>
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent animate-pulse"></div>
    </div>
  );
};

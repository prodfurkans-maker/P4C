
import React from 'react';

export const Avatar: React.FC = () => {
  return (
    <div className="w-12 h-12 relative flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl border border-white/20 overflow-hidden shadow-xl shadow-indigo-500/30">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2.5} 
        stroke="currentColor" 
        className="w-7 h-7 text-white drop-shadow-md"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
};

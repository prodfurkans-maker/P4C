
import React from 'react';

export const Avatar: React.FC = () => {
  return (
    <div className="w-10 h-10 relative flex items-center justify-center bg-white rounded-xl border border-white/10 overflow-hidden shadow-lg shadow-indigo-500/10">
      <img 
        src="https://i.ibb.co/LztfH3d/image.png" 
        alt="NextGenLAB Logo" 
        className="w-full h-full object-cover p-1"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent"></div>
    </div>
  );
};

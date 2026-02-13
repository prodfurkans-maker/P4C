
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'bot';

  return (
    <div className={`flex w-full ${isBot ? 'justify-start' : 'justify-end animate-in fade-in slide-in-from-bottom-2 duration-300'}`}>
      <div className={`max-w-[90%] px-5 py-4 rounded-[2rem] shadow-2xl text-base leading-relaxed ${
        isBot 
          ? 'glass text-slate-100 rounded-bl-none border-l-2 border-indigo-500' 
          : 'bg-indigo-600 text-white rounded-br-none shadow-indigo-900/10'
      }`}>
        {isBot && (
          <div className="flex items-center gap-2 mb-2">
             <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Rehber</span>
          </div>
        )}
        <p className="font-medium tracking-tight whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

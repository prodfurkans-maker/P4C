
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'bot';

  return (
    <div className={`flex w-full ${isBot ? 'justify-start' : 'justify-end animate-in fade-in slide-in-from-bottom-2 duration-500'}`}>
      <div className={`max-w-[85%] px-8 py-6 rounded-[2.5rem] shadow-2xl text-xl leading-relaxed ${
        isBot 
          ? 'glass text-slate-100 rounded-bl-none border-l-4 border-indigo-500 font-light' 
          : 'bg-indigo-600 text-white rounded-br-none shadow-indigo-900/40 font-semibold'
      }`}>
        {isBot && (
          <div className="flex items-center gap-2 mb-4">
             <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Sorgulama Arkadaşın</span>
          </div>
        )}
        <p className="tracking-tight whitespace-pre-wrap">{message.text}</p>
        {isBot && (
          <div className="mt-4 flex justify-end">
            <span className="text-[14px] opacity-40">✨</span>
          </div>
        )}
      </div>
    </div>
  );
};

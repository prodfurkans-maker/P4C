
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'bot';

  return (
    <div className={`flex w-full ${isBot ? 'justify-start' : 'justify-end animate-in fade-in slide-in-from-bottom-4 duration-500'}`}>
      <div className={`max-w-[92%] px-6 py-5 rounded-[2.5rem] shadow-2xl text-lg leading-relaxed ${
        isBot 
          ? 'glass text-slate-100 rounded-bl-none border-l-4 border-indigo-500' 
          : 'bg-indigo-600 text-white rounded-br-none shadow-indigo-900/20 font-medium'
      }`}>
        {isBot && (
          <div className="flex items-center gap-2 mb-3">
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Bilgelik Rehberi</span>
          </div>
        )}
        <p className="tracking-tight whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

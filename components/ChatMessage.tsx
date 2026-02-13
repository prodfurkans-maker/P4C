
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'bot';

  return (
    <div className={`flex w-full ${isBot ? 'justify-start' : 'justify-end animate-in fade-in slide-in-from-bottom-2 duration-300'}`}>
      <div className={`max-w-[85%] px-7 py-5 message-bubble shadow-xl text-lg leading-relaxed ${
        isBot 
          ? 'glass text-slate-100 border-l-4 border-indigo-500' 
          : 'bg-indigo-600 text-white shadow-indigo-900/20'
      }`}>
        {isBot && (
          <div className="flex items-center gap-2 mb-3">
             <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Soru Ustası</span>
          </div>
        )}
        <p className="font-medium tracking-tight whitespace-pre-wrap">{message.text}</p>
        <div className="flex justify-end mt-3">
          <span className="text-[9px] font-bold opacity-30 italic">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

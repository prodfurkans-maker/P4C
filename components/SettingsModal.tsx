
import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentKey }) => {
  const [key, setKey] = useState(currentKey);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-md glass p-8 rounded-[3rem] border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col gap-8 relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Sistem Ayarları</h2>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-slate-400 text-sm font-light">Uygulamayı aktif etmek için Groq API anahtarınızı girmeniz gerekmektedir.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2">Groq API Key</label>
            <div className="relative">
               <input 
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full p-5 glass rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder:text-slate-700 transition-all font-mono text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-20">⚡</div>
            </div>
          </div>

          <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 space-y-3">
             <p className="text-[10px] text-indigo-300 leading-relaxed font-medium">
               Groq API anahtarı, Llama-3 modellerini en hızlı şekilde çalıştırmanızı sağlar. Anahtarınız sadece bu cihazda saklanır.
             </p>
             <a 
              href="https://console.groq.com/keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] font-black text-white underline underline-offset-4 hover:text-indigo-400 transition-colors uppercase tracking-widest"
             >
               Groq anahtarını buradan al <span className="text-xs">↗</span>
             </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button 
            onClick={() => onSave(key)}
            disabled={!key.trim()}
            className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-indigo-500 disabled:opacity-20 transition-all shadow-xl active:scale-95 border border-white/10"
          >
            GROQ SİSTEMİNİ BAŞLAT 🚀
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('GROQ_API_KEY');
              setKey('');
              onSave('');
            }}
            className="w-full text-red-400 py-2 text-[10px] font-black uppercase tracking-[0.3em] hover:text-red-300 transition-colors"
          >
            Sistemi Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
};

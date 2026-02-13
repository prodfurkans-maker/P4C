
import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { getGeminiResponse } from './services/geminiService';
import { Avatar } from './components/Avatar';
import { ChatMessage } from './components/ChatMessage';
import { SettingsModal } from './components/SettingsModal';

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('GROQ_API_KEY'));
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: 'Merhaba zihin kaşifi! Ben senin düşünce arkadaşınım. Bugün dünyayı hangi pencereden sorgulamak istersin?',
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isStarted) scrollToBottom();
  }, [messages, isStarted]);

  const handleSaveKey = (newKey: string) => {
    localStorage.setItem('GROQ_API_KEY', newKey);
    setApiKey(newKey);
    setShowSettings(false);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map(msg => ({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const responseText = await getGeminiResponse(input, history);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: responseText,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      if (error.message === "API_KEY_INVALID" || error.message === "API_KEY_MISSING") {
        setShowSettings(true);
        setMessages(prev => [...prev, {
          id: 'error',
          role: 'bot',
          text: 'Eyvah! Groq API anahtarınla ilgili bir sorun var. Ayarlar menüsünden geçerli bir anahtar girdiğine emin olmalısın.',
          timestamp: Date.now(),
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasKey = !!apiKey;

  if (!isStarted) {
    return (
      <div className="min-h-[100dvh] bg-[#020617] flex flex-col items-center justify-between p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[120px] rounded-full animate-aurora"></div>
        <div className="absolute bottom-[-5%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full animate-aurora"></div>

        <div className="w-full max-w-xl z-10 flex flex-col items-center text-center pt-12">
          <div className="flex justify-between w-full mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]"></span>
              <span className="text-[9px] font-black text-indigo-100 uppercase tracking-widest">Powered by Groq</span>
            </div>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-3 rounded-2xl glass border-white/10 text-indigo-300 hover:text-white transition-all active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.361.2.779.31 1.226.31.447 0 .865-.11 1.226-.31.332-.184.582-.496.645-.87l.213-1.281c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.361.2.779.31 1.226.31.447 0 .865-.11 1.226-.31.332-.184.582-.496.645-.87l.213-1.281c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-gradient leading-[0.85]">
            ZİHNİN<br />YOLCULUĞU
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-12 font-light leading-relaxed max-w-md mx-auto">
            Groq hızında çalışan, <span className="text-white font-bold underline decoration-indigo-500/50 underline-offset-8">dünyanın en hızlı</span> felsefi rehberi.
          </p>

          <div className="w-full space-y-4 px-4">
            <button 
              onClick={() => hasKey ? setIsStarted(true) : setShowSettings(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-7 rounded-[2.5rem] text-2xl font-black transition-all shadow-[0_25px_50px_rgba(79,70,229,0.4)] flex items-center justify-center gap-4 active:scale-95 border border-white/10"
            >
              {hasKey ? 'MACERAYA BAŞLA ⚡' : 'GROQ KEY GİRİŞİ YAP 🔑'}
            </button>
            {!hasKey && (
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-2 animate-pulse">
                Sistemi başlatmak için Groq API anahtarı gereklidir
              </p>
            )}
          </div>
        </div>

        <div className="w-full max-w-xl z-10 grid grid-cols-2 gap-4 pb-12 mt-12 opacity-50">
          <div className="glass p-6 rounded-[2rem] border-white/5 flex flex-col justify-between h-32">
            <span className="text-2xl">⚡</span>
            <p className="text-white text-xs font-bold">Ultra Hızlı Yanıt</p>
          </div>
          <div className="glass p-6 rounded-[2rem] border-white/5 flex flex-col justify-between h-32">
            <span className="text-2xl">🧠</span>
            <p className="text-white text-xs font-bold">Llama-3 Gücü</p>
          </div>
        </div>

        <SettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
          onSave={handleSaveKey}
          currentKey={apiKey || ''}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] max-w-2xl mx-auto bg-[#020617] relative shadow-2xl">
      <header className="glass p-6 flex items-center justify-between z-20 border-b border-white/5 sticky top-0 backdrop-blur-3xl">
        <div className="flex items-center gap-4">
          <Avatar />
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Düşünen Dostum</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
              <p className="text-[9px] text-indigo-300 font-black uppercase tracking-widest">Groq Engine Llama-3</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-indigo-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.361.2.779.31 1.226.31.447 0 .865-.11 1.226-.31.332-.184.582-.496.645-.87l.213-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button 
            onClick={() => setIsStarted(false)}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 md:p-8 space-y-8 custom-scrollbar pb-36">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass px-8 py-5 rounded-[2.5rem] flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
              </div>
              <span className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.3em]">Hızla Düşünüyorum...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="absolute bottom-0 left-0 w-full p-6 bg-[#020617]/95 backdrop-blur-md pt-10">
        <form onSubmit={handleSend} className="max-w-xl mx-auto relative flex gap-3 group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Derin bir soru sormaya ne dersin?"
            className="flex-1 p-6 glass rounded-[2.5rem] outline-none focus:ring-4 focus:ring-indigo-500/20 text-white placeholder:text-slate-700 transition-all text-lg border-white/5"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 text-white p-6 rounded-[2rem] hover:bg-indigo-500 disabled:opacity-20 transition-all active:scale-90 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        onSave={handleSaveKey}
        currentKey={apiKey || ''}
      />
    </div>
  );
};

export default App;

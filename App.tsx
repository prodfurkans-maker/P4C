
import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatSession } from './types';
import { getGeminiResponse } from './services/geminiService';
import { Avatar } from './components/Avatar';
import { ChatMessage } from './components/ChatMessage';

const CodeLogo = ({ className = "h-12 w-12" }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center bg-indigo-600 rounded-[30%] shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-indigo-400/30`}>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2.5} 
      stroke="currentColor" 
      className="w-2/3 h-2/3 text-white"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  </div>
);

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('CHAT_SESSIONS');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('CHAT_SESSIONS', JSON.stringify(sessions));
  }, [sessions]);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isStarted) scrollToBottom();
  }, [messages, isStarted]);

  const startNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Yeni Düşünce Yolculuğu',
      messages: [{
        id: 'welcome',
        role: 'bot',
        text: 'Merhaba zihin ortağım! Bugün birlikte hangi merak dolu "Acaba?" sorusunun peşinden gidelim istersin?',
        timestamp: Date.now(),
      }],
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsStarted(true);
    setIsSidebarOpen(false);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !currentSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(s => s.id === currentSessionId ? {
      ...s,
      messages: [...s.messages, userMessage],
      title: s.messages.length <= 2 ? userMessage.text.slice(0, 30) : s.title,
      updatedAt: Date.now()
    } : s));
    
    setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(msg => msg.id !== 'welcome')
        .slice(-10)
        .map(msg => ({
          role: msg.role === 'bot' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        }));

      const responseText = await getGeminiResponse(userMessage.text, history);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: responseText,
        timestamp: Date.now(),
      };

      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, messages: [...s.messages, botMessage], updatedAt: Date.now() } : s
      ));
    } catch (error: any) {
       console.error("Gönderim Hatası:", error);
       const errorBotMsg: Message = {
         id: Date.now().toString(),
         role: 'bot',
         text: "Üzgünüm, şu an bağlantı kuramıyorum. Lütfen internetini kontrol edip tekrar dener misin?",
         timestamp: Date.now(),
       };
       setSessions(prev => prev.map(s => 
         s.id === currentSessionId ? { ...s, messages: [...s.messages, errorBotMsg], updatedAt: Date.now() } : s
       ));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isStarted) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-between p-8 relative overflow-hidden">
        <div className="w-full max-w-xl z-10 flex flex-col items-center text-center pt-20">
          <div className="mb-10 animate-float">
            <CodeLogo className="h-24 w-24 md:h-32 md:w-32" />
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter text-gradient leading-[0.85] uppercase">
            DÜŞÜNEN<br />AI PRO
          </h1>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 shadow-xl mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]"></span>
            <span className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em]">NextGenLAB P4C Core</span>
          </div>

          <p className="text-xl md:text-2xl text-slate-400 mb-14 font-light leading-relaxed max-w-sm mx-auto">
            Cevapları değil, <span className="text-white font-bold">soruları</span> keşfetmeye hazır mısın?
          </p>

          <div className="w-full space-y-4 px-4 max-w-sm">
            <button 
              onClick={() => sessions.length > 0 ? (setCurrentSessionId(sessions[0].id), setIsStarted(true)) : startNewChat()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-[2rem] text-xl font-black transition-all shadow-[0_20px_40px_rgba(79,70,229,0.3)] active:scale-95 border border-white/10"
            >
              YOLCULUĞA BAŞLA 🚀
            </button>
            {sessions.length > 0 && (
              <button 
                onClick={() => { setIsSidebarOpen(true); setIsStarted(true); }}
                className="w-full glass py-5 rounded-[2rem] text-lg font-bold text-slate-300 transition-all border-white/5 hover:border-white/20 active:scale-95"
              >
                ESKİ DEFTERLERİM
              </button>
            )}
          </div>
        </div>

        <footer className="w-full text-center py-12 z-10">
          <p className="text-[11px] text-indigo-400 font-black tracking-[0.3em] uppercase">© 2024 NextGenLAB · P4C Metodolojisi</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />}

      <aside className={`fixed lg:static top-0 left-0 h-full w-80 glass border-r border-white/5 z-[70] sidebar-transition flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CodeLogo className="h-8 w-8" />
            <span className="text-xs font-black tracking-widest text-indigo-400 uppercase tracking-[0.2em]">NEXTGENLAB</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          <button onClick={startNewChat} className="w-full flex items-center gap-3 p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl text-indigo-400 font-black text-[11px] hover:bg-indigo-600/20 transition-all mb-4 uppercase tracking-[0.2em]">
            Yeni Sorgulama Başlat
          </button>

          {sessions.map(s => (
            <button 
              key={s.id}
              onClick={() => { setCurrentSessionId(s.id); setIsSidebarOpen(false); }}
              className={`w-full text-left p-4 rounded-2xl transition-all border text-xs font-bold ${currentSessionId === s.id ? 'bg-indigo-600/15 border-indigo-600/30 text-white shadow-lg shadow-indigo-500/10' : 'border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
            >
              # {s.title}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative bg-[#020617]/40">
        <header className="glass p-5 flex items-center justify-between z-20 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-xl glass border-white/10 text-slate-400 active:scale-95 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <Avatar />
            <div>
              <h1 className="text-lg font-black text-white uppercase tracking-tight">Düşünen Dostum</h1>
              <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em]">Pedagojik Mod Aktif</p>
            </div>
          </div>
          <button onClick={() => setIsStarted(false)} className="p-2.5 rounded-xl hover:bg-white/10 text-slate-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-10 space-y-10 custom-scrollbar pb-40">
          {!currentSessionId ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 uppercase tracking-[0.5em] font-black text-sm animate-pulse">
               Zihin Yolculuğu Hazır
            </div>
          ) : (
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="glass px-6 py-4 rounded-[2rem] flex items-center gap-4 border-l-2 border-indigo-500 shadow-xl">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-[9px] text-indigo-300 font-black uppercase tracking-[0.3em]">Analiz Ediliyor...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent pt-20">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3 p-2 bg-white/[0.05] border border-white/10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl focus-within:border-indigo-500/50 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Neyi merak ediyorsun?"
              className="flex-1 bg-transparent py-4 px-6 outline-none text-white placeholder:text-white/20 text-lg font-medium"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-500 transition-all disabled:opacity-20 active:scale-90 shadow-lg shadow-indigo-600/30">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;

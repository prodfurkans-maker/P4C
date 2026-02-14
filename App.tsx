
import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatSession } from './types';
import { getGeminiResponse } from './services/geminiService';
import { Avatar } from './components/Avatar';
import { ChatMessage } from './components/ChatMessage';

const CodeLogo = ({ className = "h-12 w-12" }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center bg-indigo-600 rounded-[30%] shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-indigo-400/30`}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2/3 h-2/3 text-white">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  </div>
);

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isStarted) scrollToBottom();
  }, [currentSessionId, sessions, isStarted]);

  const handleOpenKeyDialog = async () => {
    try {
      if ((window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        setNeedsAuth(false);
        alert("Bağlantı başarıyla sağlandı!");
      }
    } catch (err) {
      console.error("Diyalog açılamadı", err);
    }
  };

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
      updatedAt: Date.now()
    } : s));
    
    setInput('');
    setIsLoading(true);

    try {
      const currentMessages = sessions.find(s => s.id === currentSessionId)?.messages || [];
      const history = [...currentMessages, userMessage]
        .slice(-8)
        .map(msg => ({
          role: msg.role === 'bot' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        }));

      const responseText = await getGeminiResponse(userMessage.text, history);
      
      const botMessage: Message = {
        id: Date.now().toString(),
        role: 'bot',
        text: responseText,
        timestamp: Date.now(),
      };

      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, messages: [...s.messages, botMessage], updatedAt: Date.now() } : s
      ));
    } catch (error: any) {
       console.error("Hata:", error);
       if (error.message === "AUTH_REQUIRED" || error.message === "API_KEY_MISSING") {
         setNeedsAuth(true);
       }
       const errorText = error.message === "AUTH_REQUIRED" 
         ? "Sisteme güvenli bağlantı kurulamadı. Lütfen aşağıdaki butona basarak bağlantıyı etkinleştir." 
         : "Bağlantı kesildi, lütfen internetini kontrol et.";
       
       const errorBotMsg: Message = {
         id: Date.now().toString(),
         role: 'bot',
         text: errorText,
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
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-float mb-12">
          <CodeLogo className="h-28 w-28 md:h-36 md:w-36" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 text-gradient uppercase tracking-tighter">DÜŞÜNEN AI</h1>
        <p className="text-xl text-slate-400 mb-12 max-w-md font-light">Cevapları değil, soruları keşfetmeye hazır mısın?</p>
        <button 
          onClick={() => sessions.length > 0 ? (setCurrentSessionId(sessions[0].id), setIsStarted(true)) : startNewChat()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-[2rem] text-xl font-black transition-all shadow-2xl active:scale-95 border border-white/10"
        >
          YOLCULUĞA BAŞLA 🚀
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />}
      
      <aside className={`fixed lg:static top-0 left-0 h-full w-80 glass border-r border-white/5 z-[70] sidebar-transition flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <CodeLogo className="h-8 w-8" />
          <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">NEXTGENLAB</span>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <button onClick={startNewChat} className="w-full p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl text-indigo-400 font-black text-[11px] uppercase tracking-widest mb-4">Yeni Sorgulama</button>
          {sessions.map(s => (
            <button key={s.id} onClick={() => { setCurrentSessionId(s.id); setIsSidebarOpen(false); }} className={`w-full text-left p-4 rounded-2xl text-xs font-bold transition-all ${currentSessionId === s.id ? 'bg-indigo-600/20 border border-indigo-600/30 text-white' : 'text-slate-500 hover:bg-white/5'}`}>
              # {s.title}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative bg-[#020617]/40">
        <header className="glass p-5 flex items-center justify-between z-20 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 glass rounded-xl text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg></button>
            <Avatar />
            <div>
              <h1 className="text-lg font-black text-white uppercase tracking-tight">Düşünen Dostum</h1>
              <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Pedagojik Mod</p>
            </div>
          </div>
          {needsAuth && (
            <div className="flex items-center gap-4 animate-in fade-in zoom-in duration-300">
               <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="hidden md:block text-[10px] text-slate-500 hover:text-white underline uppercase font-bold tracking-widest">Fatura Rehberi</a>
               <button onClick={handleOpenKeyDialog} className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full text-[10px] font-black uppercase shadow-lg shadow-red-500/10">Sisteme Bağlan</button>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-10 space-y-10 custom-scrollbar pb-40">
          {(sessions.find(s => s.id === currentSessionId)?.messages || []).map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          {isLoading && <div className="glass px-6 py-4 rounded-full w-fit animate-pulse text-[9px] text-indigo-300 font-black uppercase tracking-widest">Derin Analiz...</div>}
          <div ref={messagesEndRef} />
        </main>

        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3 p-2 bg-white/[0.05] border border-white/10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl focus-within:border-indigo-500/50 transition-all">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Neyi merak ediyorsun?" className="flex-1 bg-transparent py-4 px-6 outline-none text-white text-lg font-medium" disabled={isLoading} />
            <button type="submit" disabled={isLoading || !input.trim()} className="bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-500 disabled:opacity-20 active:scale-90 shadow-lg shadow-indigo-600/30"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg></button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;

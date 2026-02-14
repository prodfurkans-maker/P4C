
import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatSession } from './types';
import { getGeminiResponse } from './services/geminiService';
import { Avatar } from './components/Avatar';
import { ChatMessage } from './components/ChatMessage';

const CodeLogo = ({ className = "h-12 w-12" }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center bg-indigo-600 rounded-[30%] shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-white/10`}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2/3 h-2/3 text-white">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  </div>
);

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('CHAT_SESSIONS');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
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
  }, [currentSessionId, sessions, isStarted, isLoading]);

  const startNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Yeni Yolculuk',
      messages: [{
        id: 'welcome',
        role: 'bot',
        text: 'Hoş geldin küçük filozof! Bugün zihninde hangi "acaba" dolaşıyor? Bir şeyi merak ediyor musun?',
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
    
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const session = sessions.find(s => s.id === currentSessionId);
      const history = (session?.messages || [])
        .filter(m => m.id !== 'welcome')
        .map(msg => ({
          role: msg.role === 'bot' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        }));

      const responseText = await getGeminiResponse(currentInput, history);
      
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
       console.error("Critical error:", error);
       const errorText = "Zihnim biraz karıştı... Bu soruyu başka bir şekilde anlatmak ister miydin?";
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
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-8 text-center bg-[#020617]">
        <div className="animate-float mb-12">
          <CodeLogo className="h-28 w-28 md:h-36 md:w-36" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 text-gradient uppercase tracking-tighter leading-none">DÜŞÜNEN AI</h1>
        <p className="text-xl text-slate-400 mb-12 max-w-md font-light">Kendi cevaplarını bulmaya hazır mısın?</p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={() => sessions.length > 0 ? (setCurrentSessionId(sessions[0].id), setIsStarted(true)) : startNewChat()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-[2rem] text-xl font-black transition-all shadow-2xl active:scale-95 border border-white/10"
          >
            BAŞLAYALIM ✨
          </button>
          {sessions.length > 0 && (
            <button 
              onClick={startNewChat}
              className="text-indigo-400 font-bold hover:text-white transition-colors text-xs tracking-widest uppercase"
            >
              Yeni Bir Sorgulama Başlat
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#020617]">
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />}
      
      <aside className={`fixed lg:static top-0 left-0 h-full w-80 glass border-r border-white/5 z-[70] sidebar-transition flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CodeLogo className="h-8 w-8" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">P4C REHBERİ</span>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          <button onClick={startNewChat} className="w-full p-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest mb-6 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">Yeni Yolculuk</button>
          {sessions.map(s => (
            <button key={s.id} onClick={() => { setCurrentSessionId(s.id); setIsSidebarOpen(false); }} className={`w-full text-left p-4 rounded-2xl text-xs font-bold transition-all border ${currentSessionId === s.id ? 'bg-indigo-600/10 border-indigo-500/30 text-white' : 'text-slate-500 border-transparent hover:bg-white/5'}`}>
              {s.messages[s.messages.length - 1]?.text.substring(0, 30) || 'Yeni Sorgulama'}...
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative">
        <header className="glass p-5 flex items-center justify-between z-20 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 glass rounded-xl text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <Avatar />
            <div>
              <h1 className="text-lg font-black text-white uppercase tracking-tight">Düşünen Dostum</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">P4C Akıllı Mod</p>
              </div>
            </div>
          </div>
          <button onClick={() => setIsStarted(false)} className="p-2.5 rounded-xl hover:bg-white/10 text-slate-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-10 space-y-10 custom-scrollbar pb-40">
          {(sessions.find(s => s.id === currentSessionId)?.messages || []).map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          {isLoading && (
            <div className="flex justify-start">
              <div className="glass px-6 py-4 rounded-full flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-[9px] text-indigo-300 font-black uppercase tracking-widest">Derince Düşünüyorum...</span>
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
              placeholder="Zihninden ne geçiyor?" 
              className="flex-1 bg-transparent py-4 px-6 outline-none text-white text-lg font-medium placeholder:text-slate-700" 
              disabled={isLoading} 
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-500 disabled:opacity-20 active:scale-90 shadow-lg shadow-indigo-600/30 transition-all">
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

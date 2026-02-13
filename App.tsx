
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
      title: 'Yeni Sorgulama',
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

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Bu sohbeti silmek istediğinize emin misiniz?')) {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (currentSessionId === id) {
        setCurrentSessionId(null);
      }
    }
  };

  const clearAllChats = () => {
    if (confirm('Tüm sohbet geçmişinizi silmek istediğinize emin misiniz?')) {
      setSessions([]);
      setCurrentSessionId(null);
      setIsStarted(false);
    }
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

    const updatedSessions = sessions.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMessage],
          title: s.messages.length <= 2 ? userMessage.text.slice(0, 30) + (userMessage.text.length > 30 ? '...' : '') : s.title,
          updatedAt: Date.now()
        };
      }
      return s;
    });
    setSessions(updatedSessions);
    setInput('');
    setIsLoading(true);

    try {
      // Sadece kullanıcı ve bot arasındaki aktif diyalogu al (Karşılama mesajını filtreler)
      const sessionMessages = updatedSessions.find(s => s.id === currentSessionId)?.messages || [];
      const history = sessionMessages
        .filter(msg => msg.id !== 'welcome') // Hoşgeldin mesajını API geçmişinden çıkarıyoruz (User ile başlaması şart)
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
       console.error("Uygulama Hatası:", error);
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
            ZİHNİN<br />YOLCULUĞU
          </h1>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 shadow-xl mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]"></span>
            <span className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em]">NextGenLAB AI Experience</span>
          </div>

          <p className="text-xl md:text-2xl text-slate-400 mb-14 font-light leading-relaxed max-w-sm mx-auto">
            Geleceği sorgulayarak inşa eden <span className="text-white font-bold">pedagojik zeka.</span>
          </p>

          <div className="w-full space-y-4 px-4 max-w-sm">
            <button 
              onClick={() => sessions.length > 0 ? (setCurrentSessionId(sessions[0].id), setIsStarted(true)) : startNewChat()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-[2rem] text-xl font-black transition-all shadow-[0_20px_40px_rgba(79,70,229,0.3)] active:scale-95 border border-white/10"
            >
              YOLCULUĞA BAŞLA ⚡
            </button>
            {sessions.length > 0 && (
              <button 
                onClick={() => { setIsSidebarOpen(true); setIsStarted(true); }}
                className="w-full glass py-5 rounded-[2rem] text-lg font-bold text-slate-300 transition-all border-white/5 hover:border-white/20 active:scale-95"
              >
                SORGULAMA GEÇMİŞİM
              </button>
            )}
          </div>
        </div>

        <footer className="w-full text-center py-12 z-10 flex flex-col items-center gap-3">
          <div className="px-6 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-sm">
            <p className="text-[11px] text-indigo-400 font-black tracking-[0.3em] uppercase">P4C Metodolojisine Pedagojik Olarak Uygundur</p>
          </div>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-2">© 2024 NextGenLAB · Lisanslı Yapay Zeka Çözümü</p>
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
            <span className="text-xs font-black tracking-widest text-indigo-400 uppercase">NEXTGEN CORE</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          <button onClick={startNewChat} className="w-full flex items-center gap-3 p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl text-indigo-400 font-black text-[11px] hover:bg-indigo-600/20 transition-all mb-4 uppercase tracking-[0.2em] group">
            <div className="p-2 bg-indigo-600/20 rounded-xl group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            Yeni Sorgulama Başlat
          </button>

          {sessions.map(s => (
            <div key={s.id} className="group relative">
              <button 
                onClick={() => { setCurrentSessionId(s.id); setIsSidebarOpen(false); }}
                className={`w-full text-left p-4 rounded-2xl transition-all border flex items-center gap-3 pr-14 ${currentSessionId === s.id ? 'bg-indigo-600/15 border-indigo-600/30 text-white shadow-xl' : 'border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
              >
                <span className="text-sm opacity-20 font-black">#</span>
                <span className="truncate text-xs font-bold tracking-tight">{s.title}</span>
              </button>
              <button 
                onClick={(e) => deleteSession(e, s.id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-slate-600 hover:text-red-400 transition-all active:scale-90 bg-white/0 hover:bg-red-500/10 rounded-xl"
                title="Sohbeti Sil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-white/5">
           <button onClick={clearAllChats} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black text-slate-600 hover:text-red-400 uppercase tracking-[0.3em] transition-colors active:scale-95">
              Hepsini Kalıcı Olarak Sil
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative max-w-5xl mx-auto lg:mx-0 lg:max-w-none bg-[#020617]/40">
        <header className="glass p-5 lg:p-7 flex items-center justify-between z-20 border-b border-white/5 backdrop-blur-3xl sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 rounded-2xl glass border-white/10 text-slate-400 active:scale-95 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <Avatar />
            <div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase leading-tight">Düşünen Dostum</h1>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em]">NextGenLAB AI Core v3.2</p>
            </div>
          </div>
          <button onClick={() => setIsStarted(false)} className="p-3 rounded-2xl hover:bg-white/10 text-slate-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-14 space-y-12 custom-scrollbar pb-56">
          {!currentSessionId ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20 animate-pulse">
               <CodeLogo className="h-16 w-16 opacity-30 grayscale" />
               <p className="text-xl font-black uppercase tracking-[0.5em]">Lütfen Bir Sorgulama Oturumu Başlatın</p>
            </div>
          ) : (
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="glass px-8 py-6 rounded-[2.5rem] flex items-center gap-6 border-l-4 border-indigo-500 shadow-2xl">
                <div className="flex gap-2.5">
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
                </div>
                <span className="text-[11px] text-indigo-300 font-black uppercase tracking-[0.5em]">Zihin Analizi Sürüyor...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent pt-20">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
            <div className="relative flex items-center gap-3 p-2 bg-white/[0.08] border border-white/30 rounded-[3rem] backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] transition-all focus-within:border-indigo-500/60 focus-within:bg-white/[0.12] focus-within:shadow-[0_0_60px_rgba(99,102,241,0.3)] group-hover:border-white/40">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Buraya merak dolu bir 'Acaba?' bırak..."
                className="flex-1 bg-transparent py-5 px-8 outline-none text-white placeholder:text-white/40 text-lg md:text-xl font-semibold tracking-tight transition-all"
                disabled={isLoading || !currentSessionId}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim() || !currentSessionId} 
                className="bg-indigo-600 text-white p-5 rounded-full hover:bg-indigo-500 disabled:opacity-20 transition-all shadow-[0_10px_25px_rgba(79,70,229,0.3)] active:scale-90 flex-shrink-0 group/btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-6">
                 <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-black hover:text-indigo-400 transition-colors">Cognitive Intelligence</p>
                 <span className="w-1.5 h-1.5 rounded-full bg-white/10"></span>
                 <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-black hover:text-indigo-400 transition-colors">P4C Architecture</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;

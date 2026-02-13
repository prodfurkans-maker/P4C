
import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatSession } from './types';
import { getGeminiResponse } from './services/geminiService';
import { Avatar } from './components/Avatar';
import { ChatMessage } from './components/ChatMessage';
import { SettingsModal } from './components/SettingsModal';

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('GROQ_API_KEY'));
  
  // Chat States
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('CHAT_SESSIONS');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync sessions to localStorage
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
        text: 'Merhaba zihin kaşifi! Ben senin düşünce arkadaşınım. Bugün dünyayı hangi pencereden sorgulamak istersin?',
        timestamp: Date.now(),
      }],
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsStarted(true);
    setIsSidebarOpen(false);
  };

  const handleSaveKey = (newKey: string) => {
    localStorage.setItem('GROQ_API_KEY', newKey);
    setApiKey(newKey);
    setShowSettings(false);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !currentSessionId) return;

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

    // Update session with user message
    const updatedSessions = sessions.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMessage],
          title: s.messages.length === 1 ? userMessage.text.slice(0, 30) + '...' : s.title,
          updatedAt: Date.now()
        };
      }
      return s;
    });
    setSessions(updatedSessions);
    setInput('');
    setIsLoading(true);

    try {
      const history = (updatedSessions.find(s => s.id === currentSessionId)?.messages || [])
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
      if (error.message === "API_KEY_INVALID" || error.message === "API_KEY_MISSING") {
        setShowSettings(true);
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
              <span className="text-[9px] font-black text-indigo-100 uppercase tracking-widest">NextGenLAB Experience</span>
            </div>
            <button onClick={() => setShowSettings(true)} className="p-3 rounded-2xl glass border-white/10 text-indigo-300 hover:text-white transition-all active:scale-90">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <img src="https://i.ibb.co/LztfH3d/image.png" alt="Logo" className="w-24 h-24 mb-6 drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter text-gradient leading-[0.85]">
            ZİHNİN<br />YOLCULUĞU
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-12 font-light leading-relaxed max-w-md mx-auto">
            Sorgulamayı öğreten pedagojik zeka.
          </p>

          <div className="w-full space-y-4 px-4">
            <button 
              onClick={() => hasKey ? (sessions.length > 0 ? (setCurrentSessionId(sessions[0].id), setIsStarted(true)) : startNewChat()) : setShowSettings(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-[2.5rem] text-xl font-black transition-all shadow-[0_20px_40px_rgba(79,70,229,0.3)] active:scale-95"
            >
              {hasKey ? 'YOLCULUĞA BAŞLA ⚡' : 'SİSTEMİ KUR 🔑'}
            </button>
            {sessions.length > 0 && (
              <button 
                onClick={() => { setIsSidebarOpen(true); setIsStarted(true); }}
                className="w-full glass py-5 rounded-[2.5rem] text-lg font-bold text-slate-300 transition-all border-white/5"
              >
                GEÇMİŞ SORGULAMALARIM
              </button>
            )}
          </div>
        </div>

        <footer className="w-full text-center py-8 z-10 space-y-2">
          <p className="text-[10px] text-indigo-300 font-black tracking-[0.4em] uppercase">Pedagojik Olarak P4C Metodolojisine Uygundur</p>
          <p className="text-[9px] text-slate-600 font-medium">© 2024 NextGenLAB. Tüm Hakları Saklıdır.</p>
        </footer>

        <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} onSave={handleSaveKey} currentKey={apiKey || ''} />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] bg-[#020617] overflow-hidden">
      {/* Sidebar / Desktop Background Overlay for Mobile */}
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />}

      {/* Sidebar Content */}
      <aside className={`fixed lg:static top-0 left-0 h-full w-80 glass border-r border-white/5 z-[70] sidebar-transition flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://i.ibb.co/LztfH3d/image.png" alt="Logo" className="w-8 h-8" />
            <span className="font-black text-xs tracking-widest text-indigo-400">NEXTGEN LAB</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          <button onClick={startNewChat} className="w-full flex items-center gap-3 p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl text-indigo-400 font-black text-xs hover:bg-indigo-600/20 transition-all mb-6 uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Yeni Sorgulama
          </button>

          {sessions.map(s => (
            <div key={s.id} className="group relative">
              <button 
                onClick={() => { setCurrentSessionId(s.id); setIsSidebarOpen(false); }}
                className={`w-full text-left p-4 rounded-2xl transition-all border flex items-center gap-3 ${currentSessionId === s.id ? 'bg-white/5 border-white/10 text-white shadow-xl' : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
              >
                <span className="text-lg opacity-40">#</span>
                <span className="truncate text-sm font-bold">{s.title}</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setSessions(prev => prev.filter(x => x.id !== s.id)); if(currentSessionId === s.id) setCurrentSessionId(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5">
           <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 p-4 glass rounded-2xl text-slate-400 font-bold hover:text-white transition-all text-sm">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ayarlar
           </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative max-w-4xl mx-auto lg:mx-0 lg:max-w-none">
        <header className="glass p-5 flex items-center justify-between z-20 border-b border-white/5 backdrop-blur-3xl sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 rounded-2xl glass border-white/10 text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <Avatar />
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">Düşünen Dostum</h1>
              <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">NextGenLAB AI Core</p>
            </div>
          </div>
          <button onClick={() => setIsStarted(false)} className="p-3 rounded-2xl hover:bg-white/5 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-10 space-y-8 custom-scrollbar pb-40">
          {!currentSessionId ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
               <img src="https://i.ibb.co/LztfH3d/image.png" className="w-20 grayscale" alt="Logo" />
               <p className="text-lg font-bold">Lütfen bir sorgulama başlatın</p>
            </div>
          ) : (
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="glass px-8 py-5 rounded-[2.5rem] flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
                </div>
                <span className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">Zihin Sarayında Geziniyorum...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent pt-10">
          <form onSubmit={handleSend} className="max-w-2xl mx-auto relative flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Düşünceni buraya dök..."
              className="flex-1 p-5 glass rounded-[2.5rem] outline-none focus:ring-4 focus:ring-indigo-500/20 text-white placeholder:text-slate-700 transition-all text-lg border-white/5"
              disabled={isLoading || !currentSessionId}
            />
            <button type="submit" disabled={isLoading || !input.trim() || !currentSessionId} className="bg-indigo-600 text-white p-5 rounded-[2rem] hover:bg-indigo-500 disabled:opacity-20 transition-all shadow-lg active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
          <p className="text-center text-[8px] text-slate-700 mt-4 uppercase tracking-[0.6em] font-black">NextGenLAB Cogitative Intelligence v2.0</p>
        </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} onSave={handleSaveKey} currentKey={apiKey || ''} />
    </div>
  );
};

export default App;

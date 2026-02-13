
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

  const clearAllChats = () => {
    if(confirm('Tüm sohbet geçmişinizi silmek istediğinize emin misiniz?')) {
      setSessions([]);
      setCurrentSessionId(null);
      setIsStarted(false);
    }
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
      <div className="min-h-[100dvh] flex flex-col items-center justify-between p-8 relative overflow-hidden">
        <div className="w-full max-w-xl z-10 flex flex-col items-center text-center pt-16">
          <div className="mb-12 animate-float">
            <img 
              src="https://i.ibb.co/LztfH3d/image.png" 
              alt="NextGenLAB Logo" 
              className="w-32 h-32 md:w-40 md:h-40 drop-shadow-[0_0_30px_rgba(99,102,241,0.4)]" 
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 shadow-xl mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]"></span>
            <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">NextGenLAB AI Experience</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-gradient leading-[0.85] uppercase">
            ZİHNİN<br />YOLCULUĞU
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-12 font-light leading-relaxed max-w-sm mx-auto">
            Geleceği sorgulayarak inşa eden <span className="text-white font-bold">pedagojik zeka.</span>
          </p>

          <div className="w-full space-y-4 px-4 max-w-md">
            <button 
              onClick={() => hasKey ? (sessions.length > 0 ? (setCurrentSessionId(sessions[0].id), setIsStarted(true)) : startNewChat()) : setShowSettings(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-[2rem] text-xl font-black transition-all shadow-[0_20px_40px_rgba(79,70,229,0.3)] active:scale-95 border border-white/10"
            >
              {hasKey ? 'YOLCULUĞA BAŞLA ⚡' : 'SİSTEMİ AKTİF ET 🔑'}
            </button>
            {sessions.length > 0 && (
              <button 
                onClick={() => { setIsSidebarOpen(true); setIsStarted(true); }}
                className="w-full glass py-5 rounded-[2rem] text-lg font-bold text-slate-300 transition-all border-white/5 hover:border-white/20"
              >
                SORGULAMA GEÇMİŞİM
              </button>
            )}
          </div>
        </div>

        <footer className="w-full text-center py-10 z-10">
          <div className="flex flex-col items-center gap-2">
            <p className="text-[11px] text-indigo-400 font-black tracking-[0.4em] uppercase opacity-80">P4C Metodolojisine Pedagojik Olarak Uygundur</p>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent my-2"></div>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">© 2024 NextGenLAB · Lisanslı Yapay Zeka Çözümü</p>
          </div>
        </footer>

        <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} onSave={handleSaveKey} currentKey={apiKey || ''} />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />}

      <aside className={`fixed lg:static top-0 left-0 h-full w-80 glass border-r border-white/5 z-[70] sidebar-transition flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://i.ibb.co/LztfH3d/image.png" alt="Logo" className="w-8 h-8 drop-shadow-lg" />
            <span className="font-black text-xs tracking-[0.2em] text-white">NEXTGEN LAB</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          <button onClick={startNewChat} className="w-full flex items-center gap-3 p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl text-indigo-400 font-black text-xs hover:bg-indigo-600/20 transition-all mb-4 uppercase tracking-widest group">
            <div className="p-1.5 bg-indigo-600/20 rounded-lg group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            Yeni Sorgulama
          </button>

          {sessions.map(s => (
            <div key={s.id} className="group relative">
              <button 
                onClick={() => { setCurrentSessionId(s.id); setIsSidebarOpen(false); }}
                className={`w-full text-left p-4 rounded-2xl transition-all border flex items-center gap-3 pr-12 ${currentSessionId === s.id ? 'bg-indigo-600/10 border-indigo-600/30 text-white shadow-xl' : 'border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
              >
                <span className="text-lg opacity-30 group-hover:opacity-100 transition-opacity">#</span>
                <span className="truncate text-sm font-bold tracking-tight">{s.title}</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setSessions(prev => prev.filter(x => x.id !== s.id)); if(currentSessionId === s.id) setCurrentSessionId(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-red-400 transition-all active:scale-90"
                title="Sohbeti Sil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244 2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-white/5 space-y-3">
           <button onClick={clearAllChats} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black text-slate-600 hover:text-red-400 uppercase tracking-widest transition-colors">
              Hepsini Temizle
           </button>
           <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 p-4 glass rounded-2xl text-slate-400 font-bold hover:text-white transition-all text-sm border-white/5 shadow-inner">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Sistem Ayarları
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative max-w-5xl mx-auto lg:mx-0 lg:max-w-none">
        <header className="glass p-5 lg:p-7 flex items-center justify-between z-20 border-b border-white/5 backdrop-blur-3xl sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 rounded-2xl glass border-white/10 text-slate-400 active:scale-95 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <Avatar />
            <div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase">Düşünen Dostum</h1>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">NextGenLAB AI Core v2.4</p>
            </div>
          </div>
          <button onClick={() => setIsStarted(false)} className="p-3 rounded-2xl hover:bg-white/10 text-slate-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-12 space-y-10 custom-scrollbar pb-44">
          {!currentSessionId ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30 animate-pulse">
               <img src="https://i.ibb.co/LztfH3d/image.png" className="w-24 grayscale brightness-50" alt="Logo" />
               <p className="text-xl font-black uppercase tracking-[0.4em]">Keşfe Başlamak İçin Bir Oturum Seçin</p>
            </div>
          ) : (
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="glass px-8 py-6 rounded-[2.5rem] flex items-center gap-5 border-l-4 border-indigo-500">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
                </div>
                <span className="text-[11px] text-indigo-300 font-black uppercase tracking-[0.4em]">Zihin Sarayı Analizi...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent pt-12">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex gap-4 group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Sorgulamak istediğin ne varsa buraya dök..."
              className="flex-1 p-6 glass rounded-[2.5rem] outline-none focus:ring-4 focus:ring-indigo-500/20 text-white placeholder:text-slate-700 transition-all text-lg border-white/5 shadow-2xl"
              disabled={isLoading || !currentSessionId}
            />
            <button type="submit" disabled={isLoading || !input.trim() || !currentSessionId} className="bg-indigo-600 text-white p-6 rounded-full hover:bg-indigo-500 disabled:opacity-20 transition-all shadow-[0_15px_30px_rgba(79,70,229,0.3)] active:scale-90 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
          <div className="flex justify-center mt-6">
            <p className="text-[9px] text-slate-700 uppercase tracking-[0.6em] font-black">NextGenLAB · Llama-3 Powered Felsefi Zeka</p>
          </div>
        </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} onSave={handleSaveKey} currentKey={apiKey || ''} />
    </div>
  );
};

export default App;

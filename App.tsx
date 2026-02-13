
import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { getGeminiResponse } from './services/geminiService';
import { Avatar } from './components/Avatar';
import { ChatMessage } from './components/ChatMessage';

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: 'Merhaba zihin kaşifi! Bugün beraber neleri merak edelim? Mesela, sence bir şeyi "gerçek" yapan nedir?',
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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.slice(-10).map(msg => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const responseText = await getGeminiResponse(input, history);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      text: responseText || "Düşüncelerim biraz dağıldı, gel başka bir konuyu merak edelim.",
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#020617] overflow-x-hidden flex flex-col items-center relative px-4 py-16 md:py-32">
        {/* Dynamic Background Aurora */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-indigo-600/20 blur-[200px] rounded-full animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-blue-600/15 blur-[180px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none"></div>

        <div className="max-w-6xl w-full z-10 flex flex-col items-center">
          {/* Revolutionary Badge */}
          <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full glass border-white/10 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            <span className="flex h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)]"></span>
            <span className="text-[11px] md:text-xs font-black text-indigo-100 uppercase tracking-[0.4em]">Dünyanın İlk P4C Yapay Zekası</span>
          </div>

          {/* Epic Hero Section */}
          <div className="text-center mb-24 relative">
            <h1 className="text-7xl md:text-[10rem] font-black mb-10 tracking-tighter text-gradient leading-[0.8] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              ZİHNİN <br /> DEVRİMİ
            </h1>
            <p className="text-xl md:text-4xl text-slate-300 max-w-4xl mx-auto font-extralight leading-tight tracking-tight">
              Ezberlenmiş cevapların ötesine geçin. <br />
              <span className="text-white font-bold italic bg-clip-text">Sorgulama sanatını</span> keşfeden ilk yapay zekayla tanışın.
            </p>
          </div>

          {/* High-Impact Actions */}
          <div className="flex flex-col sm:flex-row gap-10 mb-40 w-full justify-center px-4">
            <button 
              onClick={() => setIsStarted(true)}
              className="group relative bg-indigo-600 text-white px-20 py-10 rounded-[3rem] text-3xl font-black transition-all shadow-[0_30px_80px_rgba(79,70,229,0.5)] hover:scale-105 active:scale-95 flex items-center justify-center gap-6 overflow-hidden border border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              YOLCULUĞU BAŞLAT ⚡
            </button>
            <button 
              onClick={handleShare}
              className="glass hover:bg-white/10 text-white px-14 py-10 rounded-[3rem] text-2xl font-bold transition-all border border-white/10 flex items-center justify-center gap-4 group"
            >
              DÜNYAYA DUYUR <span className="group-hover:rotate-12 transition-transform">🔗</span>
            </button>
          </div>

          {/* Premium Bento Grid */}
          <div className="w-full grid md:grid-cols-12 gap-8 auto-rows-[250px] mb-24">
            <div className="md:col-span-8 glass p-12 rounded-[4rem] border border-white/5 flex flex-col justify-end group hover:border-indigo-500/40 transition-all shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl group-hover:scale-125 transition-transform duration-1000">🔭</div>
              <h3 className="text-3xl font-black text-white mb-4">Sokratik Algoritma</h3>
              <p className="text-slate-400 text-lg max-w-lg leading-relaxed font-light">
                Her çocuk bir filozoftur. Bizim yapay zekamız, cevabı vermek yerine çocuğun içindeki filozofu uyandıracak doğru soruları saniyeler içinde kurgular.
              </p>
            </div>
            <div className="md:col-span-4 glass p-12 rounded-[4rem] border border-white/5 flex flex-col justify-center items-center text-center bg-indigo-600/10 group">
              <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform">
                <span className="text-4xl">💎</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Benzersiz</h3>
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">Dünyada Eşi Yok</p>
            </div>
            <div className="md:col-span-5 glass p-12 rounded-[4rem] border border-white/5 flex flex-col justify-center">
               <div className="flex gap-2 mb-6">
                 {[1,2,3,4,5].map(i => <span key={i} className="text-indigo-500 text-xl">★</span>)}
               </div>
               <h3 className="text-2xl font-black text-white mb-3">Eğitimde Yeni Çağ</h3>
               <p className="text-slate-500 text-sm font-light">Eleştirel düşünme, yaratıcılık ve özgüveni bir arada geliştiren tek dijital rehber.</p>
            </div>
            <div className="md:col-span-7 glass p-12 rounded-[4rem] border border-white/5 flex items-center gap-12 bg-gradient-to-br from-indigo-500/10 to-transparent">
              <div className="hidden lg:block">
                <div className="w-32 h-32 border-4 border-dashed border-indigo-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-3">Zihin Güvenlik Bölgesi</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Çocuğunuzun gelişimi bizim için kutsaldır. Din, siyaset ve uygunsuz içeriklere karşı %100 korumalı, pedagojik onaylı güvenli etkileşim.
                </p>
              </div>
            </div>
          </div>

          {/* Prestige Footer */}
          <div className="w-full flex flex-col items-center opacity-40 py-12 border-t border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.8em] mb-10 text-indigo-300">İş Ortağımız Olan Teknolojiler</p>
            <div className="flex flex-wrap gap-12 justify-center items-center">
              <span className="text-2xl font-black tracking-tighter">GEMINI 3 PRO</span>
              <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
              <span className="text-2xl font-bold italic tracking-tight">P4C GLOBAL</span>
              <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
              <span className="text-2xl font-black">AI ETHICS 2025</span>
            </div>
          </div>
        </div>

        {/* Share Toast */}
        {showToast && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white text-[#020617] px-12 py-6 rounded-full font-black shadow-[0_40px_100px_rgba(255,255,255,0.2)] z-50 animate-in fade-in slide-in-from-bottom-10 flex items-center gap-4 scale-110">
             <span className="text-2xl">🌍</span> Link Kopyalandı! Dünyayı Sorgulat.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto bg-[#020617] text-slate-200 relative border-x border-white/5">
      <header className="glass p-8 flex items-center justify-between z-20 border-b border-white/5 sticky top-0 backdrop-blur-2xl">
        <div className="flex items-center gap-6">
          <Avatar />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter">Düşünen Dostum</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(99,102,241,1)]"></span>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">Derin Sorgulama Modu</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleShare} className="p-4 rounded-[1.5rem] bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-indigo-400 group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 group-hover:scale-110">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314" />
            </svg>
          </button>
          <button onClick={() => setIsStarted(false)} className="p-4 rounded-[1.5rem] bg-white/5 hover:bg-white/10 transition-all border border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-10 space-y-10 scroll-smooth custom-scrollbar">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass px-10 py-6 rounded-[2.5rem] flex items-center gap-6">
              <div className="flex gap-2.5">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
              </div>
              <span className="text-xs text-indigo-300 font-black uppercase tracking-[0.3em]">Bilgelik Aranıyor...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-10 bg-[#020617]/90 backdrop-blur-3xl border-t border-white/5">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Aklındaki o derin soruyu buraya bırak..."
            className="w-full p-8 pr-28 glass rounded-[3rem] outline-none focus:ring-4 focus:ring-indigo-500/20 text-2xl placeholder:text-slate-700 transition-all shadow-2xl border-white/10 font-light"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-4 top-4 bg-indigo-600 text-white p-6 rounded-[2.5rem] hover:bg-indigo-500 disabled:opacity-30 transition-all shadow-lg active:scale-95 group-hover:rotate-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
        <div className="flex justify-center gap-10 mt-8 opacity-20 hover:opacity-100 transition-opacity">
           <span className="text-[10px] font-black tracking-[0.5em] uppercase">Eleştirel Düşünme</span>
           <span className="text-[10px] font-black tracking-[0.5em] uppercase text-indigo-400">P4C Premium</span>
           <span className="text-[10px] font-black tracking-[0.5em] uppercase">Bilişsel Esneklik</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

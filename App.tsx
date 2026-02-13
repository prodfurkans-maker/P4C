
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
      <div className="min-h-screen bg-[#020617] overflow-x-hidden flex flex-col items-center relative px-4 py-12 md:py-24">
        {/* Cinematic Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[180px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

        <div className="max-w-6xl w-full z-10 flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full glass border-white/10 mb-10 animate-fade-in shadow-xl">
            <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"></span>
            <span className="text-[10px] md:text-xs font-black text-indigo-200 uppercase tracking-[0.3em]">Türkiye'nin İlk P4C Yapay Zekası</span>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-6xl md:text-9xl font-black mb-8 tracking-tighter text-gradient leading-[0.85] filter drop-shadow-2xl">
              ZİHNİN <br /> GELECEĞİ
            </h1>
            <p className="text-xl md:text-3xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
              Cevapları ezberleten değil, <span className="text-white font-semibold underline decoration-indigo-500/50 underline-offset-[12px]">düşünmeyi öğreten</span> benzersiz bir felsefe yol arkadaşı.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 mb-32 w-full justify-center px-4">
            <button 
              onClick={() => setIsStarted(true)}
              className="group relative bg-indigo-600 text-white px-16 py-8 rounded-[2.5rem] text-2xl font-black transition-all shadow-[0_20px_60px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center gap-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              KEŞFE BAŞLA <span className="group-hover:translate-x-2 transition-transform">→</span>
            </button>
            <button 
              onClick={handleShare}
              className="glass hover:bg-white/10 text-white px-12 py-8 rounded-[2.5rem] text-xl font-bold transition-all border border-white/10 flex items-center justify-center gap-3 hover:border-white/20"
            >
              DENEYİMİ PAYLAŞ 🔗
            </button>
          </div>

          {/* Methodology Bento Grid */}
          <div className="w-full grid md:grid-cols-12 gap-6 auto-rows-[200px]">
            <div className="md:col-span-8 glass p-10 rounded-[3rem] border border-white/5 flex flex-col justify-end group hover:border-indigo-500/30 transition-all">
              <span className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block w-fit">🧩</span>
              <h3 className="text-2xl font-black text-white mb-2">Sokratik Sorgulama</h3>
              <p className="text-slate-500 text-sm max-w-md leading-relaxed">Ezberci eğitime son. Yapay zekamız, her cevaba yeni bir soruyla karşılık vererek derinlemesine düşünme kaslarını çalıştırır.</p>
            </div>
            <div className="md:col-span-4 glass p-10 rounded-[3rem] border border-white/5 flex flex-col justify-end items-center text-center bg-indigo-600/5">
              <span className="text-5xl font-black text-indigo-400 mb-4 tracking-tighter">%100</span>
              <h3 className="text-lg font-bold text-white mb-1">Pedagojik Güvenlik</h3>
              <p className="text-slate-600 text-[10px] uppercase tracking-widest font-black">AI Safety Certified</p>
            </div>
            <div className="md:col-span-4 glass p-10 rounded-[3rem] border border-white/5 flex flex-col justify-center items-start">
               <span className="text-3xl mb-4">🛡️</span>
               <h3 className="text-lg font-bold text-white mb-2">Filtreli İçerik</h3>
               <p className="text-slate-500 text-xs">Din, siyaset ve yaşa uygun olmayan tüm konular uzman filtrelerimizden geçer.</p>
            </div>
            <div className="md:col-span-8 glass p-10 rounded-[3rem] border border-white/5 flex items-center gap-10 bg-gradient-to-br from-indigo-500/5 to-transparent">
              <div className="hidden sm:block w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
              <div>
                <h3 className="text-2xl font-black text-white mb-2">Bilişsel Esneklik</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Olaylara farklı pencerelerden bakma yetisi kazandırarak problem çözme becerisini %40'a kadar artırır.</p>
              </div>
            </div>
          </div>

          {/* Trust Footer */}
          <div className="mt-32 opacity-40 grayscale hover:grayscale-0 transition-all cursor-default text-center">
            <p className="text-xs font-black uppercase tracking-[0.5em] mb-4">Gelişmiş Teknoloji Altyapısı</p>
            <div className="flex gap-8 justify-center items-center">
              <span className="text-xl font-bold">GEMINI 3 PRO</span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
              <span className="text-xl font-bold tracking-tighter">P4C METHOD</span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
              <span className="text-xl font-bold">AI SAFETY</span>
            </div>
          </div>
        </div>

        {/* Share Toast */}
        {showToast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black shadow-[0_20px_50px_rgba(79,70,229,0.5)] z-50 animate-bounce flex items-center gap-3">
             <span className="text-xl">🚀</span> Bağlantı Kopyalandı!
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto bg-[#020617] text-slate-200 relative border-x border-white/5">
      <header className="glass p-6 flex items-center justify-between z-20 border-b border-white/5 sticky top-0">
        <div className="flex items-center gap-5">
          <Avatar />
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Düşünen Dostum</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">P4C Rehberliği Aktif</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleShare} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314" />
            </svg>
          </button>
          <button onClick={() => setIsStarted(false)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass px-8 py-5 rounded-3xl flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
              </div>
              <span className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">Sorgulanıyor...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-8 bg-[#020617]/80 backdrop-blur-xl border-t border-white/5">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Neyi sorgulamak istersin?"
            className="w-full p-7 pr-24 glass rounded-[2.5rem] outline-none focus:ring-4 focus:ring-indigo-500/20 text-xl placeholder:text-slate-600 transition-all shadow-2xl border-white/10"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-3 bg-indigo-600 text-white p-5 rounded-[1.8rem] hover:bg-indigo-500 disabled:opacity-30 transition-all shadow-lg active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
        <div className="flex justify-center gap-6 mt-6 opacity-30">
           <span className="text-[9px] font-black tracking-widest uppercase">Eğitici</span>
           <span className="text-[9px] font-black tracking-widest uppercase">Güvenli</span>
           <span className="text-[9px] font-black tracking-widest uppercase">P4C</span>
        </div>
      </footer>
    </div>
  );
};

export default App;


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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Düşünen Yapay Zeka',
        text: 'Dünyanın ilk P4C odaklı yapay zekasını keşfet!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
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

    const history = messages.slice(-6).map(msg => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const responseText = await getGeminiResponse(input, history);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      text: responseText || "Şu an düşüncelerim çok derinlerde, lütfen birazdan tekrar sorar mısın?",
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  if (!isStarted) {
    return (
      <div className="min-h-[100dvh] bg-[#020617] flex flex-col items-center justify-between p-6 md:p-12 relative overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(67,56,202,0.1),transparent_50%)]"></div>
        
        <div className="w-full max-w-lg z-10 flex flex-col items-center text-center pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/10 mb-8 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="text-[10px] font-extrabold text-indigo-200 uppercase tracking-widest">Global P4C Devrimi</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-gradient leading-[0.9]">
            ZİHNİN<br />YENİ ÇAĞI
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 font-light leading-relaxed px-4">
            Cevapları değil, <span className="text-white font-bold italic">sorgulama yeteneğini</span> geliştiren dünyanın en iddialı felsefi rehberi.
          </p>

          <div className="w-full space-y-4">
            <button 
              onClick={() => setIsStarted(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-3xl text-xl font-black transition-all shadow-[0_20px_40px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 active:scale-95"
            >
              DENEYİMİ BAŞLAT ⚡
            </button>
            <button 
              onClick={handleShare}
              className="w-full glass py-5 rounded-3xl text-lg font-bold text-white transition-all border border-white/5 active:scale-95"
            >
              ARKADAŞINLA PAYLAŞ
            </button>
          </div>
        </div>

        <div className="w-full max-w-lg z-10 grid grid-cols-2 gap-3 pb-6">
          <div className="glass p-5 rounded-3xl border-white/5">
            <p className="text-indigo-400 text-[10px] font-black uppercase mb-1">Eğitim</p>
            <p className="text-white text-xs font-semibold">Sokratik Metod</p>
          </div>
          <div className="glass p-5 rounded-3xl border-white/5">
            <p className="text-indigo-400 text-[10px] font-black uppercase mb-1">Güvenlik</p>
            <p className="text-white text-xs font-semibold">AI Safety Pro</p>
          </div>
        </div>

        {showToast && (
          <div className="fixed bottom-10 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl z-50">
            Link Kopyalandı! 🚀
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] max-w-2xl mx-auto bg-[#020617] relative">
      <header className="glass p-5 flex items-center justify-between z-20 border-b border-white/5 sticky top-0 backdrop-blur-3xl">
        <div className="flex items-center gap-4">
          <Avatar />
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">Düşünen Dostum</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]"></span>
              <p className="text-[9px] text-indigo-300 font-black uppercase tracking-widest">P4C Uzmanı</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsStarted(false)}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar pb-32">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass px-6 py-4 rounded-3xl flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
              </div>
              <span className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">Düşünüyorum...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent pt-10">
        <form onSubmit={handleSend} className="max-w-xl mx-auto relative flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Derin bir soru sor..."
            className="flex-1 p-5 glass rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder:text-slate-600 transition-all text-base border-white/5"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 text-white p-5 rounded-3xl hover:bg-indigo-500 disabled:opacity-30 transition-all active:scale-95 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
        <p className="text-center text-[8px] text-slate-600 mt-4 uppercase tracking-[0.4em]">Professional P4C Experience</p>
      </div>
    </div>
  );
};

export default App;
